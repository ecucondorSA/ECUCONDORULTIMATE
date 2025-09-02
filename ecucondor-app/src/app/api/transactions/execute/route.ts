import { logger } from '@/lib/utils/logger';
import { NextRequest } from 'next/server'
import { ExchangeRateService } from '@/lib/services/exchange-rates'
import { TransactionLimitsService } from '@/lib/services/transaction-limits'
import { PriceLockService } from '@/lib/services/price-lock'
import { createClient } from '@/lib/supabase/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api'

interface TransactionRequest {
  user_id: string
  pair: string
  amount: number
  transaction_type: 'buy' | 'sell'
  price_lock_id?: string // Optional - for locked price execution
}

export async function POST(request: NextRequest) {
  try {
    const body: TransactionRequest = await request.json()
    
    const { user_id, pair, amount, transaction_type, price_lock_id } = body

    // Validate required fields
    if (!user_id || !pair || !amount || !transaction_type) {
      return createErrorResponse(
        'Missing required fields: user_id, pair, amount, transaction_type',
        400
      )
    }

    if (amount <= 0) {
      return createErrorResponse('Amount must be greater than 0', 400)
    }

    if (!['buy', 'sell'].includes(transaction_type)) {
      return createErrorResponse('Transaction type must be buy or sell', 400)
    }

    // Initialize services
    const exchangeService = ExchangeRateService.getInstance()
    const limitsService = TransactionLimitsService.getInstance()
    const priceLockService = PriceLockService.getInstance()

    await exchangeService.updateRates()

    const pairUpper = pair.toUpperCase()
    const rate = exchangeService.getRate(pairUpper)

    if (!rate) {
      return createErrorResponse(`Exchange rate for ${pairUpper} not found`, 404)
    }

    // Calculate USD amount for limits validation
    let amountUSD: number
    if (transaction_type === 'sell' && rate.base_currency === 'USD') {
      amountUSD = amount
    } else if (transaction_type === 'buy' && rate.target_currency === 'USD') {
      // For buy transactions, calculate how much USD will be received
      const transaction = exchangeService.calculateTransaction(pairUpper, amount, transaction_type)
      amountUSD = transaction?.base_amount || amount * 0.0007 // fallback estimation
    } else {
      // For non-USD pairs, rough estimation
      amountUSD = rate.base_currency === 'ARS' ? amount / (rate.binance_rate || 1000) : amount * 0.18
    }

    // Validate transaction limits
    const validation = await limitsService.validateTransaction(user_id, amountUSD, transaction_type)
    if (!validation.valid) {
      return createErrorResponse(
        'Transaction limits exceeded',
        400,
        JSON.stringify({
          errors: validation.errors,
          warnings: validation.warnings,
          limits_info: validation.limits_info
        })
      )
    }

    // Handle price lock validation if provided
    let usedPriceLock = null

    if (price_lock_id) {
      const lockValidation = await priceLockService.validatePriceLock(
        price_lock_id,
        user_id,
        pairUpper,
        amountUSD,
        transaction_type
      )

      if (!lockValidation.valid) {
        return createErrorResponse(
          `Price lock validation failed: ${lockValidation.error}`,
          400
        )
      }

      usedPriceLock = lockValidation.priceLock
      // Note: In a complete implementation, we would use the locked rate
      // For now, we just track that a price lock was used
    }

    // Calculate final transaction
    const transaction = exchangeService.calculateTransaction(
      pairUpper, 
      amount, 
      transaction_type
    )

    if (!transaction) {
      return createErrorResponse('Failed to calculate transaction', 500)
    }

    // Create transaction record in database
    const supabase = await createClient()
    const transactionRecord = {
      user_id,
      pair: pairUpper,
      transaction_type,
      base_currency: rate.base_currency,
      target_currency: rate.target_currency,
      base_amount: transaction.base_amount,
      target_amount: transaction.target_amount,
      rate_used: transaction.rate_used,
      commission: transaction.commission,
      commission_rate: transaction_type === 'sell' ? rate.commission_rate : 0,
      amount_usd: amountUSD,
      status: 'pending',
      price_lock_id: price_lock_id || null,
      metadata: {
        original_rate: rate,
        price_locked: !!price_lock_id,
        limits_info: validation.limits_info
      }
    }

    const { data: createdTransaction, error: createError } = await supabase
      .from('transactions')
      .insert([transactionRecord])
      .select()
      .single()

    if (createError) {
      logger.error('Error creating transaction record:', createError)
      return createErrorResponse('Failed to create transaction record', 500)
    }

    // Mark price lock as used if provided
    if (price_lock_id && usedPriceLock) {
      const lockUsed = await priceLockService.usePriceLock(price_lock_id)
      if (!lockUsed) {
        logger.warn(`Failed to mark price lock ${price_lock_id} as used`)
      }
    }

    // In a real implementation, you would:
    // 1. Integrate with payment processors
    // 2. Handle bank transfers
    // 3. Update transaction status to 'processing' then 'completed'
    // 4. Send notifications to user
    // 5. Update user balances

    // For now, simulate processing and mark as completed
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing delay

    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('id', createdTransaction.id)

    if (updateError) {
      logger.error('Error updating transaction status:', updateError)
    }

    return createSuccessResponse({
      transaction: {
        id: createdTransaction.id,
        ...transaction,
        amount_usd: amountUSD,
        status: 'completed',
        created_at: createdTransaction.created_at,
        price_locked: !!price_lock_id,
        locked_rate: usedPriceLock?.rate
      },
      validation: {
        valid: true,
        warnings: validation.warnings,
        limits_remaining: validation.limits_info
      },
      price_lock: usedPriceLock ? {
        id: usedPriceLock.id,
        rate: usedPriceLock.rate,
        used: true
      } : null
    })

  } catch (error) {
    logger.error('❌ Error in /api/transactions/execute:', error)
    
    return createErrorResponse(
      'Failed to execute transaction',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}