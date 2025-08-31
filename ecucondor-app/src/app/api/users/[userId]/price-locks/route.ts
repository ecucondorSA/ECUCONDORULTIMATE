import { NextRequest } from 'next/server'
import { PriceLockService } from '@/lib/services/price-lock'
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

    const priceLockService = PriceLockService.getInstance()
    const activePriceLocks = await priceLockService.getUserActivePriceLocks(userId)

    // Add status information to each price lock
    const priceLockDetails = await Promise.all(
      activePriceLocks.map(async (lock) => {
        const status = await priceLockService.getPriceLockStatus(lock.id)
        return {
          ...lock,
          status: status.valid ? 'active' : 'expired',
          expires_in_minutes: status.expires_in_minutes,
          time_remaining: status.expires_in_minutes ? `${status.expires_in_minutes}m` : 'expired'
        }
      })
    )

    return createSuccessResponse({
      user_id: userId,
      active_price_locks: priceLockDetails,
      count: priceLockDetails.length,
      summary: {
        total_locks: priceLockDetails.length,
        total_locked_amount_usd: priceLockDetails.reduce((sum, lock) => sum + lock.amount_usd, 0),
        pairs: [...new Set(priceLockDetails.map(lock => lock.pair))]
      }
    })

  } catch (error) {
    console.error(`❌ Error getting user price locks for ${userId}:`, error)
    
    return createErrorResponse(
      'Failed to get user price locks',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    
    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    const priceLockService = PriceLockService.getInstance()
    
    // Get all active price locks for user
    const activePriceLocks = await priceLockService.getUserActivePriceLocks(userId)
    
    if (activePriceLocks.length === 0) {
      return createSuccessResponse({
        message: 'No active price locks to cancel',
        cancelled_count: 0
      })
    }

    // Cancel all active locks by marking them as used
    let cancelledCount = 0
    for (const lock of activePriceLocks) {
      const success = await priceLockService.usePriceLock(lock.id)
      if (success) {
        cancelledCount++
      }
    }

    return createSuccessResponse({
      message: `Cancelled ${cancelledCount} price locks`,
      cancelled_count: cancelledCount,
      total_locks: activePriceLocks.length
    })

  } catch (error) {
    console.error(`❌ Error cancelling user price locks for ${userId}:`, error)
    
    return createErrorResponse(
      'Failed to cancel user price locks',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}