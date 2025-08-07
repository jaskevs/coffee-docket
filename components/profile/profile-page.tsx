"use client"

import React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, User, Mail, Phone, Bell, ArrowLeft, Eye, EyeOff, Lock, Edit, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabaseService, type Customer } from "@/lib/supabase-service"
import { supabaseClient } from "@/lib/supabase" // Import supabaseClient

interface ProfilePageProps {
  onNavigate: (page: string) => void
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, updateProfile, changePassword } = useAuth()
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerLoading, setCustomerLoading] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [notificationMessage, setNotificationMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  )
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isAdminEditMode, setIsAdminEditMode] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    notificationLowBalance: true,
    notificationTopup: true,
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Add state for tracking email changes and verification:
  const [originalEmail, setOriginalEmail] = useState("")
  const [emailChanged, setEmailChanged] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)

  // Load customer data on component mount (only for customers)
  React.useEffect(() => {
    const loadCustomerData = async () => {
      if (user && user.role !== "admin") {
        setCustomerLoading(true)
        try {
          // Try to get customer by ID first, then by email if available
          let customerData = await supabaseService.getCustomerById(user.id)
          
          if (!customerData && user.email) {
            customerData = await supabaseService.getCustomerByEmail(user.email)
          }
          if (customerData) {
            setCustomer(customerData)
            setProfileForm({
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              email: customerData.email,
              phone: customerData.phone || "",
            })
            setNotificationSettings({
              notificationLowBalance: customerData.notificationLowBalance,
              notificationTopup: customerData.notificationTopup,
            })
            setOriginalEmail(customerData.email)
          }
        } catch (error) {
          console.error("Error loading customer data:", error)
        } finally {
          setCustomerLoading(false)
        }
      } else {
        setCustomerLoading(false)
      }
    }

    loadCustomerData()
  }, [user])

  const handleBack = () => {
    if (user?.role === "admin") {
      onNavigate("admin-dashboard")
    } else {
      onNavigate("customer-dashboard")
    }
  }

  const validateProfileForm = () => {
    const errors: string[] = []

    if (!profileForm.email.trim()) {
      errors.push("Email address is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.push("Please enter a valid email address")
    }

    if (!profileForm.firstName.trim()) {
      errors.push("First name is required")
    }

    if (!profileForm.lastName.trim()) {
      errors.push("Last name is required")
    }

    return errors
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMessage(null)

    // Validate form
    const validationErrors = validateProfileForm()
    if (validationErrors.length > 0) {
      setProfileMessage({ type: "error", text: validationErrors.join(". ") })
      return
    }

    setIsProfileLoading(true)

    try {
      // Check if email has changed
      const emailHasChanged = profileForm.email !== originalEmail

      if (emailHasChanged && supabaseClient) {
        // Send email verification for new email
        const { error: emailError } = await supabaseClient.auth.updateUser({
          email: profileForm.email,
        })

        if (emailError) {
          setProfileMessage({ type: "error", text: "Failed to update email. Please try again." })
          setIsProfileLoading(false)
          return
        }

        setEmailVerificationSent(true)
        setProfileMessage({
          type: "success",
          text: "Verification email sent to your new email address. Please check your inbox and verify before the changes take effect.",
        })
      }

      // Update auth profile (only if email hasn't changed or verification was successful)
      if (!emailHasChanged) {
        const success = await updateProfile({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email,
        })

        if (success && customer && user?.role !== "admin") {
          // Update customer record with phone
          const updatedCustomer = await supabaseService.updateCustomer(customer.id, {
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
            email: profileForm.email,
            phone: profileForm.phone || undefined,
          })
          setCustomer(updatedCustomer)
          setOriginalEmail(profileForm.email)
        }

        if (!emailHasChanged) {
          setProfileMessage({ type: "success", text: "Profile updated successfully!" })
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setProfileMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotificationMessage(null)
    setIsNotificationLoading(true)

    try {
      if (customer && user?.role !== "admin") {
        // Update customer record with notification settings
        const updatedCustomer = await supabaseService.updateCustomer(customer.id, {
          notificationLowBalance: notificationSettings.notificationLowBalance,
          notificationTopup: notificationSettings.notificationTopup,
        })
        setCustomer(updatedCustomer)
        setNotificationMessage({ type: "success", text: "Notification settings updated successfully!" })
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
      setNotificationMessage({ type: "error", text: "Failed to update notification settings. Please try again." })
    } finally {
      setIsNotificationLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long." })
      return
    }

    setIsPasswordLoading(true)
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordMessage({ type: "success", text: "Password changed successfully!" })
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordMessage({ type: "error", text: "Failed to change password. Please try again." })
    } finally {
      setIsPasswordLoading(false)
    }
  }

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  // Admin Profile View with Edit Mode
  if (user?.role === "admin") {
    const handleAdminProfileSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setProfileMessage(null)

      // Validate form
      const validationErrors = validateProfileForm()
      if (validationErrors.length > 0) {
        setProfileMessage({ type: "error", text: validationErrors.join(". ") })
        return
      }

      setIsProfileLoading(true)

      try {
        // Update admin_users table directly using supabaseService
        const supabase = await import("@/lib/supabase").then((m) => m.getSupabaseClient())
        if (supabase) {
          const { error } = await supabase
            .from("admin_users")
            .update({
              first_name: profileForm.firstName,
              last_name: profileForm.lastName,
              email: profileForm.email,
            })
            .eq("id", user.id)

          if (error) {
            throw error
          }

          // Update the auth context user
          const success = await updateProfile({
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
            email: profileForm.email,
          })

          if (success) {
            setProfileMessage({ type: "success", text: "Profile updated successfully!" })
            setIsAdminEditMode(false)
          } else {
            throw new Error("Failed to update auth context")
          }
        } else {
          // Fallback to auth context only
          const success = await updateProfile({
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
            email: profileForm.email,
          })

          if (success) {
            setProfileMessage({ type: "success", text: "Profile updated successfully!" })
            setIsAdminEditMode(false)
          } else {
            throw new Error("Failed to update profile")
          }
        }
      } catch (error) {
        console.error("Error updating admin profile:", error)
        setProfileMessage({ type: "error", text: "Failed to update profile. Please try again." })
      } finally {
        setIsProfileLoading(false)
      }
    }

    const handleCancelEdit = () => {
      // Reset form to original values
      setProfileForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: "",
      })
      setIsAdminEditMode(false)
      setProfileMessage(null)
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Success/Error Message */}
          {profileMessage && (
            <div
              className={`p-4 rounded-lg ${
                profileMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="default">Admin</Badge>
                {!isAdminEditMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdminEditMode(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="flex items-center space-x-2">
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      required
                      readOnly={!isAdminEditMode}
                      className={!isAdminEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      required
                      readOnly={!isAdminEditMode}
                      className={!isAdminEditMode ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                    readOnly={!isAdminEditMode}
                    className={!isAdminEditMode ? "bg-gray-50" : ""}
                  />
                </div>
                {isAdminEditMode && (
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isProfileLoading}>
                      {isProfileLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Change Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {passwordMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      passwordMessage.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}
                <Button type="submit" disabled={isPasswordLoading}>
                  {isPasswordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Customer Profile View (Tabbed Version)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setProfileForm((prev) => ({ ...prev, email: newEmail }))
    setEmailChanged(newEmail !== originalEmail)
    setEmailVerificationSent(false)
    if (profileMessage) setProfileMessage(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Password</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Success/Error Message */}
            {profileMessage && (
              <div
                className={`p-4 rounded-lg ${
                  profileMessage.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={(e) => {
                          setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                          if (profileMessage) setProfileMessage(null)
                        }}
                        placeholder="First name"
                        required
                        className={!profileForm.firstName.trim() ? "border-red-300" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={(e) => {
                          setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                          if (profileMessage) setProfileMessage(null)
                        }}
                        placeholder="Last name"
                        required
                        className={!profileForm.lastName.trim() ? "border-red-300" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email *</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleEmailChange}
                        placeholder="Email address"
                        required
                        className={!profileForm.email.trim() ? "border-red-300" : ""}
                      />
                      {emailChanged && !emailVerificationSent && (
                        <p className="text-sm text-amber-600 flex items-center space-x-1">
                          <span>⚠️</span>
                          <span>Email verification will be required for this change</span>
                        </p>
                      )}
                      {emailVerificationSent && (
                        <p className="text-sm text-blue-600 flex items-center space-x-1">
                          <span>📧</span>
                          <span>Verification email sent. Please check your inbox.</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isProfileLoading} className="w-full md:w-auto">
                    {isProfileLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Profile Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Success/Error Message */}
            {notificationMessage && (
              <div
                className={`p-4 rounded-lg ${
                  notificationMessage.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {notificationMessage.text}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="low-balance">Low Balance Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your coffee balance is running low
                        </p>
                      </div>
                      <Switch
                        id="low-balance"
                        checked={notificationSettings.notificationLowBalance}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notificationLowBalance: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="topup">Top-up Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when coffee credits are added to your account
                        </p>
                      </div>
                      <Switch
                        id="topup"
                        checked={notificationSettings.notificationTopup}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, notificationTopup: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isNotificationLoading} className="w-full md:w-auto">
                    {isNotificationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Notification Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="password" className="space-y-6">
            {/* Success/Error Message */}
            {passwordMessage && (
              <div
                className={`p-4 rounded-lg ${
                  passwordMessage.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {passwordForm.newPassword &&
                    passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-sm text-destructive">Passwords do not match</p>
                    )}

                  <Button
                    type="submit"
                    disabled={isPasswordLoading || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="w-full md:w-auto"
                  >
                    {isPasswordLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
