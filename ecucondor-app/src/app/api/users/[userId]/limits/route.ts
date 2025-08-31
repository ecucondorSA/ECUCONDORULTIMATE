import { NextRequest } from 'next/server'
import { TransactionLimitsService } from '@/lib/services/transaction-limits'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    
    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    const limitsService = TransactionLimitsService.getInstance()
    
    // Get user's current limits status
    const limitsStatus = await limitsService.getUserLimitsStatus(userId)
    
    // Get transaction summary for additional context
    const transactionSummary = await limitsService.getUserTransactionSummary(userId)

    return createSuccessResponse({
      user_id: userId,
      limits: limitsStatus,
      current_usage: {
        monthly_volume_usd: transactionSummary.current_month_volume_usd,
        daily_volume_usd: transactionSummary.current_day_volume_usd,
        daily_transaction_count: transactionSummary.current_day_transaction_count,
        last_transaction: transactionSummary.last_transaction_date
      },
      available_limits: {
        can_transact: limitsStatus.monthly.remaining > 0 && limitsStatus.daily_transactions.remaining > 0,
        max_single_transaction: Math.min(
          limitsStatus.per_transaction.max,
          limitsStatus.monthly.remaining
        ),
        remaining_monthly_usd: limitsStatus.monthly.remaining,
        remaining_daily_transactions: limitsStatus.daily_transactions.remaining
      }
    })

  } catch (error) {
    console.error(`❌ Error getting user limits for ${userId}:`, error)
    
    return createErrorResponse(
      'Failed to get user limits',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    const body = await request.json()
    const { amount_usd } = body
    
    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    if (!amount_usd || amount_usd <= 0) {
      return createErrorResponse('Valid amount_usd is required', 400)
    }

    const limitsService = TransactionLimitsService.getInstance()
    
    // Check if user can make this transaction
    const canTransact = await limitsService.canMakeTransaction(userId, amount_usd)

    return createSuccessResponse({
      user_id: userId,
      amount_usd,
      can_proceed: canTransact.canProceed,
      reason: canTransact.reason,
      remaining_amount: canTransact.remainingAmount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`❌ Error checking transaction limits for ${userId}:`, error)
    
    return createErrorResponse(
      'Failed to check transaction limits',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}