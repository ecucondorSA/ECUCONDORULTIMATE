import { NextRequest } from 'next/server'
import { PriceLockService } from '@/lib/services/price-lock'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lockId: string }> }
) {
  const { lockId } = await params
  try {
    
    if (!lockId) {
      return createErrorResponse('Price lock ID is required', 400)
    }

    const priceLockService = PriceLockService.getInstance()
    const status = await priceLockService.getPriceLockStatus(lockId)

    if (!status.valid) {
      return createErrorResponse('Price lock not found or expired', 404)
    }

    return createSuccessResponse({
      lock_id: lockId,
      valid: status.valid,
      expires_in_minutes: status.expires_in_minutes,
      rate: status.rate,
      expired: status.expired
    })

  } catch (error) {
    console.error(`❌ Error getting price lock ${lockId}:`, error)
    
    return createErrorResponse(
      'Failed to get price lock status',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lockId: string }> }
) {
  const { lockId } = await params
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')

    if (!lockId) {
      return createErrorResponse('Price lock ID is required', 400)
    }

    if (!userId) {
      return createErrorResponse('User ID is required', 400)
    }

    const priceLockService = PriceLockService.getInstance()
    
    // Validate ownership before deletion
    const priceLock = await priceLockService.getPriceLock(lockId)
    
    if (!priceLock) {
      return createErrorResponse('Price lock not found', 404)
    }

    if (priceLock.user_id !== userId) {
      return createErrorResponse('Unauthorized to delete this price lock', 403)
    }

    // In a real implementation, you might mark as cancelled instead of deleting
    const success = await priceLockService.usePriceLock(lockId) // Mark as used to prevent reuse
    
    if (success) {
      return createSuccessResponse({
        message: 'Price lock cancelled successfully',
        lock_id: lockId
      })
    } else {
      return createErrorResponse('Failed to cancel price lock', 500)
    }

  } catch (error) {
    console.error(`❌ Error cancelling price lock ${lockId}:`, error)
    
    return createErrorResponse(
      'Failed to cancel price lock',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}