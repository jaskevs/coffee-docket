"use client"

import React, { useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  disabled?: boolean
  threshold?: number
  className?: string
}

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  className
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    
    startY.current = e.touches[0].clientY
    setIsDragging(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled || isRefreshing) return

    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, currentY.current - startY.current)
    
    // Only allow pull when at the top of the page
    if (window.scrollY === 0 && distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, threshold * 2))
    }
  }, [isDragging, disabled, isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging || disabled || isRefreshing) return

    setIsDragging(false)

    if (pullDistance > threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
  }, [isDragging, disabled, isRefreshing, pullDistance, threshold, onRefresh])

  const refreshProgress = Math.min(pullDistance / threshold, 1)
  const showRefreshIcon = pullDistance > 10

  return (
    <div
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300 z-50",
          showRefreshIcon ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
          height: Math.min(pullDistance, 60)
        }}
      >
        <div className="bg-white rounded-full p-3 shadow-lg border">
          <RefreshCw 
            className={cn(
              "h-5 w-5 text-gray-600 transition-transform duration-300",
              isRefreshing ? "animate-spin" : "",
              refreshProgress >= 1 ? "text-blue-600" : ""
            )}
            style={{
              transform: `rotate(${refreshProgress * 360}deg)`
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}