"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIOSModalFix } from "@/hooks/use-ios-modal-fix"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface IOSSafeDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  disableIOSFix?: boolean
}

const IOSSafeDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  IOSSafeDialogContentProps
>(({ className, children, disableIOSFix = false, ...props }, ref) => {
  const { isIOS, keyboardHeight, preventAutoFocus, safeModalHeight } = useIOSModalFix()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    // Detect when dialog opens
    const element = contentRef.current
    if (element) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
            const state = element.getAttribute('data-state')
            setIsOpen(state === 'open')
          }
        })
      })

      observer.observe(element, { attributes: true })
      return () => observer.disconnect()
    }
  }, [])

  React.useEffect(() => {
    if (isOpen && !disableIOSFix && isIOS && contentRef.current) {
      // Prevent auto-focus on iOS devices
      preventAutoFocus(contentRef.current)
      
      // Focus the dialog container instead of any input
      contentRef.current.focus({ preventScroll: true })
    }
  }, [isOpen, disableIOSFix, isIOS, preventAutoFocus])

  // Calculate dynamic styles for iOS keyboard
  const dynamicStyles = React.useMemo(() => {
    if (!isIOS || disableIOSFix) return {}
    
    if (keyboardHeight > 0) {
      return {
        maxHeight: safeModalHeight,
        transform: `translate(-50%, calc(-50% - ${keyboardHeight / 2}px))`,
      }
    }
    return {}
  }, [isIOS, disableIOSFix, keyboardHeight, safeModalHeight])

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
          contentRef.current = node
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "sm:rounded-lg",
          // iOS-specific styles
          isIOS && !disableIOSFix && [
            "max-h-[90dvh]", // Use dynamic viewport height
            "overflow-y-auto", // Allow scrolling if content is too tall
            keyboardHeight > 0 && "transition-transform duration-300", // Smooth transition when keyboard appears
          ],
          className
        )}
        style={dynamicStyles}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
IOSSafeDialogContent.displayName = "IOSSafeDialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Export both the iOS-safe version and regular version
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  IOSSafeDialogContent,
  IOSSafeDialogContent as DialogContent, // Use iOS-safe version as default
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}