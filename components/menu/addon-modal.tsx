"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddOnForm } from "./add-on-form"
import type { MenuAddon } from "@/lib/supabase-service"

interface AddonModalProps {
  isOpen: boolean
  onClose: () => void
  addon?: MenuAddon | null
  onSave: (addon: MenuAddon) => Promise<void>
  isLoading?: boolean
}

export function AddonModal({ isOpen, onClose, addon, onSave, isLoading = false }: AddonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{addon ? "Edit Add-on" : "Add New Add-on"}</DialogTitle>
        </DialogHeader>
        <AddOnForm
          addon={addon || undefined}
          onSave={onSave}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}