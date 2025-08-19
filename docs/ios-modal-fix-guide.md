# iOS Modal Fix Implementation Guide

## Problem Solved
On iPad Mini (and other iOS devices) in horizontal mode, when a modal opens with a text field, the keyboard automatically appears and covers half the screen, making the modal unusable.

## Solution Implemented

### 1. Custom Hook (`use-ios-modal-fix.ts`)
- Detects iOS devices (iPhone, iPad, iPod)
- Monitors keyboard visibility using Visual Viewport API
- Provides safe focus management functions
- Calculates safe modal heights when keyboard is visible

### 2. Updated Dialog Component
The main `dialog.tsx` component now automatically:
- Prevents auto-focus on text fields when opening on iOS devices
- Focuses the modal container instead of the first input
- Adjusts modal position when keyboard appears
- Uses dynamic viewport units (dvh) for proper sizing

### 3. Global CSS Enhancements
Added iOS-specific styles that:
- Prevent zoom on input focus (16px font size minimum)
- Use dynamic viewport units for better compatibility
- Adjust modal height in landscape orientation
- Enable smooth scrolling on iOS

## How It Works

1. **On Modal Open (iOS devices)**:
   - The modal container gets focus instead of the first input
   - This prevents the keyboard from automatically appearing
   - Users can tap on an input field when they're ready to type

2. **When Keyboard Appears**:
   - The modal automatically shifts up to remain visible
   - Maximum height adjusts to available viewport space
   - Content becomes scrollable if needed

3. **Landscape Mode**:
   - Special handling for iPad in horizontal orientation
   - Reduced maximum height (85vh) to ensure visibility
   - Adjusted padding for better space utilization

## Benefits

✅ No breaking changes - all existing modals automatically get the fix
✅ Desktop behavior unchanged - only affects iOS devices
✅ Smooth animations when keyboard appears/disappears
✅ Prevents accidental zooming on input focus
✅ Works in both portrait and landscape orientations
✅ Supports all iOS devices (iPhone, iPad, iPod Touch)

## Testing

To test the implementation:
1. Open your app on an iPad Mini in landscape mode
2. Open any modal with text fields
3. Verify the modal opens without keyboard appearing
4. Tap on an input field to show keyboard
5. Confirm modal adjusts position and remains fully visible

## Optional: Manual Focus Control

If you need to manually control focus in specific modals, you can use the hook directly:

```tsx
import { useIOSModalFix } from '@/hooks/use-ios-modal-fix'

function MyModal() {
  const { isIOS, focusSafely } = useIOSModalFix()
  
  const handleSpecialFocus = () => {
    const input = document.getElementById('my-input')
    focusSafely(input, { delay: 300 }) // Focus with 300ms delay
  }
  
  // Your modal content
}
```

## Browser Compatibility

- **Full Support**: iOS Safari 12+, Chrome iOS, Firefox iOS
- **Fallback**: Older iOS versions get basic modal functionality without keyboard adjustments
- **Desktop**: Unaffected, maintains current behavior