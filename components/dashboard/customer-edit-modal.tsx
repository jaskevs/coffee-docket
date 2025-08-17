"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  Save,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  CheckCircle,
} from "lucide-react"
import { supabaseService, type Customer } from "@/lib/supabase-service"

interface CustomerEditModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedCustomer: Customer) => void
  onDelete: (customerId: string) => void
}

export function CustomerEditModal({
  customer,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: CustomerEditModalProps) {
  const [editForm, setEditForm] = useState({
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    status: customer?.status || "active",
    notificationLowBalance: customer?.notificationLowBalance ?? true,
    notificationTopup: customer?.notificationTopup ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingAuth, setIsSendingAuth] = useState(false)
  const [authEmailSent, setAuthEmailSent] = useState(false)
  const [authError, setAuthError] = useState<string>("")
  const [tempPassword, setTempPassword] = useState<string>("")

  // Update form when customer changes
  React.useEffect(() => {
    if (customer) {
      setEditForm({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        status: customer.status,
        notificationLowBalance: customer.notificationLowBalance,
        notificationTopup: customer.notificationTopup,
      })
      setAuthEmailSent(false)
      setAuthError("")
      setTempPassword("")
    }
  }, [customer])

  const handleSave = async () => {
    if (!customer) return

    setIsSaving(true)
    try {
      // Check if email was cleared
      const emailWasCleared = !editForm.email && customer.email

      const updatedCustomer = await supabaseService.updateCustomer(customer.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        status: editForm.status as "active" | "inactive",
        notificationLowBalance: editForm.notificationLowBalance,
        notificationTopup: editForm.notificationTopup,
      })

      // If email was cleared, remove authentication from Supabase
      if (emailWasCleared) {
        try {
          await supabaseService.removeCustomerAuthentication(customer.id)
        } catch (authError) {
          console.error("Error removing authentication:", authError)
          // Still continue with the save, just log the auth removal error
        }
      }

      onSave(updatedCustomer)
      onClose()
    } catch (error) {
      console.error("Error updating customer:", error)
      // Could add error handling here
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!customer) return

    setIsDeleting(true)
    try {
      await supabaseService.deleteCustomerCompletely(customer.id)
      onDelete(customer.id)
      setShowDeleteConfirmation(false)
      onClose()
    } catch (error) {
      console.error("Error deleting customer:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendAuthEmail = async () => {
    if (!customer || !editForm.email) return

    console.log("=== SEND AUTH EMAIL STARTED ===")
    console.log("Customer:", customer.firstName, customer.lastName)
    console.log("Email:", editForm.email)
    console.log("Has existing email:", !!customer.email)
    
    setIsSendingAuth(true)
    setAuthError("")

    try {
      // Only save if email changed
      if (editForm.email !== customer.email) {
        console.log("Email changed, saving customer first...")
        await handleSave()
      }
      
      // Send authentication setup email using Supabase Auth
      console.log("Sending auth invitation...")
      const result = await supabaseService.sendAuthInvitation(editForm.email, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        customerId: customer.id // Pass the customer ID to link the accounts
      })
      
      if (result.success) {
        console.log("Auth invitation sent successfully")
        setAuthEmailSent(true)
        setAuthError("") // Clear any previous errors
        
        // If temp password was returned, store it to show to admin
        if (result.tempPassword) {
          setTempPassword(result.tempPassword)
          console.log("Temporary password created:", result.tempPassword)
        }
        
        // Keep success message visible longer if temp password is shown
        setTimeout(() => {
          setAuthEmailSent(false)
          setTempPassword("")
        }, 15000)
      } else {
        throw new Error(result.error || "Failed to send authentication email")
      }
      
    } catch (error) {
      console.error("Error sending auth email:", error)
      setAuthError(error instanceof Error ? error.message : "Failed to send authentication email")
    } finally {
      setIsSendingAuth(false)
      console.log("=== SEND AUTH EMAIL COMPLETED ===")
    }
  }

  const handleClose = () => {
    setShowDeleteConfirmation(false)
    setAuthEmailSent(false)
    setAuthError("")
    setTempPassword("")
    onClose()
  }

  if (!customer) return null

  return (
    <>
      <Dialog open={isOpen && !showDeleteConfirmation} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Edit Customer Profile
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update customer information and settings
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => {
                        setEditForm((prev) => ({ ...prev, email: e.target.value }))
                        setAuthEmailSent(false)
                        setAuthError("")
                      }}
                      placeholder="Email address (optional)"
                      className="flex-1"
                    />
                    {editForm.email && editForm.email !== customer.email && (
                      <Button
                        type="button"
                        onClick={handleSendAuthEmail}
                        disabled={isSendingAuth}
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200 whitespace-nowrap"
                      >
                        {isSendingAuth ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        Send Auth
                      </Button>
                    )}
                  </div>
                  
                  {!editForm.email && customer.email && (
                    <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded border border-orange-200">
                      <AlertCircle className="w-4 h-4 mr-2 inline" />
                      Email cleared - Authentication will be removed when saved
                    </div>
                  )}
                  
                  {authEmailSent && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800">Authentication created successfully!</p>
                          <p className="text-green-700 mt-1">
                            The customer can now sign in with their email address.
                          </p>
                          {tempPassword && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                              <p className="font-medium text-blue-800 text-xs mb-1">Temporary Password:</p>
                              <code className="bg-white px-2 py-1 rounded text-blue-900 font-mono text-xs border">
                                {tempPassword}
                              </code>
                              <p className="text-blue-700 text-xs mt-1">
                                Share this with the customer or they can reset their password on the login page.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {authError && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {authError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Phone number (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm((prev) => ({ ...prev, status: value as "active" | "inactive" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h3 className="font-medium">Notification Settings</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <Label htmlFor="lowBalance" className="text-sm">Low Balance Notifications</Label>
                    <Switch
                      id="lowBalance"
                      checked={editForm.notificationLowBalance}
                      onCheckedChange={(checked) =>
                        setEditForm((prev) => ({ ...prev, notificationLowBalance: checked }))
                      }
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <Label htmlFor="topup" className="text-sm">Top-up Notifications</Label>
                    <Switch
                      id="topup"
                      checked={editForm.notificationTopup}
                      onCheckedChange={(checked) =>
                        setEditForm((prev) => ({ ...prev, notificationTopup: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirmation(true)}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete{" "}
              <strong>
                {customer?.firstName} {customer?.lastName}
              </strong>
              ?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">This action cannot be undone.</p>
                  <p className="mt-1">This will permanently delete:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Customer profile and all associated data</li>
                    <li>Transaction history</li>
                    <li>Authentication account (if exists)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Customer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}