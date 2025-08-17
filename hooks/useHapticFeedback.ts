"use client"

export function useHapticFeedback() {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' | 'impact' = 'light') => {
    // Check if device supports haptic feedback
    if ('vibrate' in navigator) {
      // Map haptic types to vibration patterns
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        selection: [5],
        impact: [15, 10, 15]
      }
      
      navigator.vibrate(patterns[type])
    }
    
    // For iOS devices with haptic feedback API
    if ('hapticFeedback' in navigator) {
      try {
        // @ts-ignore - hapticFeedback is experimental
        navigator.hapticFeedback?.impact?.(type)
      } catch (error) {
        // Silently fail if not supported
        console.debug('Haptic feedback not supported')
      }
    }
  }

  const triggerSuccess = () => triggerHaptic('light')
  const triggerError = () => triggerHaptic('heavy')
  const triggerSelection = () => triggerHaptic('selection')
  const triggerImpact = () => triggerHaptic('medium')

  return {
    triggerHaptic,
    triggerSuccess,
    triggerError,
    triggerSelection,
    triggerImpact
  }
}