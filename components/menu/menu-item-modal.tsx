"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MenuItemForm } from "./menu-item-form"
import type { MenuItem } from "@/lib/supabase-service"

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  item?: MenuItem | null
  onSave: (item: MenuItem) => Promise<void>
  isLoading?: boolean
}

export function MenuItemModal({ isOpen, onClose, item, onSave, isLoading = false }: MenuItemModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
        </DialogHeader>
        <MenuItemForm
          item={item}
          onSave={onSave}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}