"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect iOS devices and handle modal focus issues
 * Prevents keyboard from automatically appearing when modals open on iOS devices
 */
export function useIOSModalFix() {
  const [isIOS, setIsIOS] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // Detect iOS devices (iPhone, iPad, iPod)
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
      const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
      return isIOSDevice || isIPadOS
    }

    setIsIOS(checkIOS())

    // Handle visual viewport changes (keyboard show/hide)
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const keyboardOffset = window.innerHeight - window.visualViewport.height
        setKeyboardHeight(Math.max(0, keyboardOffset))
      }
    }

    // Add viewport change listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      window.visualViewport.addEventListener('scroll', handleViewportChange)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange)
        window.visualViewport.removeEventListener('scroll', handleViewportChange)
      }
    }
  }, [])

  /**
   * Focus element with iOS-safe behavior
   * @param element - The element to focus
   * @param options - Focus options
   */
  const focusSafely = (element: HTMLElement | null, options?: { delay?: number }) => {
    if (!element) return

    const doFocus = () => {
      // Prevent scrolling when focusing on iOS
      element.focus({ preventScroll: true })
      
      // Optionally scroll into view after a small delay
      if (!isIOS) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    }

    if (options?.delay) {
      setTimeout(doFocus, options.delay)
    } else {
      doFocus()
    }
  }

  /**
   * Prevent default focus on modal open for iOS
   * Call this in your modal's onOpenChange or useEffect
   */
  const preventAutoFocus = (modalElement: HTMLElement | null) => {
    if (!isIOS || !modalElement) return

    // Find all focusable elements
    const focusableElements = modalElement.querySelectorAll(
      'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
    )

    // Remove autofocus from all elements
    focusableElements.forEach((el) => {
      if (el.hasAttribute('autoFocus')) {
        el.removeAttribute('autoFocus')
      }
    })

    // Focus the modal container instead of first input
    modalElement.focus({ preventScroll: true })
  }

  return {
    isIOS,
    keyboardHeight,
    focusSafely,
    preventAutoFocus,
    // Helper to calculate safe modal height
    safeModalHeight: `calc(100dvh - ${keyboardHeight}px - 2rem)`,
    // Check if keyboard is visible
    isKeyboardVisible: keyboardHeight > 0
  }
}