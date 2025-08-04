"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SizeForm } from "./size-form"
import type { MenuSize } from "@/lib/supabase-service"

interface SizeModalProps {
  isOpen: boolean
  onClose: () => void
  size?: MenuSize | null
  onSave: (size: MenuSize) => Promise<void>
  isLoading?: boolean
}

export function SizeModal({ isOpen, onClose, size, onSave, isLoading = false }: SizeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{size ? "Edit Size" : "Add New Size"}</DialogTitle>
        </DialogHeader>
        <SizeForm
          size={size}
          onSave={onSave}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}