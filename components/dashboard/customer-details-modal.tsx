"use client"

import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

import { useState, useEffect } from "react"
import {
  Coffee,
  Loader2,
  Save,
  X,
  CreditCard,
  History,
  User,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Edit3,
  Percent,
  UserPlus,
  AlertCircle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  supabaseService,
  type Customer,
  type Transaction,
  type MenuItem,
  type MenuSize,
  type MenuAddon,
} from "@/lib/supabase-service"
import { pricingConfig } from "@/lib/pricing-config"
import { useAuth } from "@/contexts/auth-context"

interface CustomerDetailsModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
  onCustomerUpdate?: (customer: Customer) => void
}

export function CustomerDetailsModal({ customer, isOpen, onClose, onCustomerUpdate }: CustomerDetailsModalProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingAuth, setIsSendingAuth] = useState(false)
  const [authEmailSent, setAuthEmailSent] = useState(false)
  const [authError, setAuthError] = useState<string>("")
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive",
    notificationLowBalance: true,
    notificationTopup: true,
  })

  // Coffee serving state
  const [isServing, setIsServing] = useState(false)

  // Top-up state
  const [isTopUp, setIsTopUp] = useState(false)
  const [topUpForm, setTopUpForm] = useState({
    coffeeCount: 1,
    notes: "",
    drinkName: "",
    sizeName: "",
    addons: [] as string[],
    discountAmount: 0,
  })

  // Menu data from Supabase
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuSizes, setMenuSizes] = useState<MenuSize[]>([])
  const [menuAddons, setMenuAddons] = useState<MenuAddon[]>([])
  const [isMenuLoading, setIsMenuLoading] = useState(true)

  useEffect(() => {
    if (customer && isOpen) {
      setEditForm({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        status: customer.status,
        notificationLowBalance: customer.notificationLowBalance,
        notificationTopup: customer.notificationTopup,
      })
      loadTransactions()
      loadMenuData()
      setAuthEmailSent(false)
      setAuthError("")
    }
  }, [customer, isOpen])

  const loadMenuData = async () => {
    setIsMenuLoading(true)
    try {
      const [items, sizes, addons] = await Promise.all([
        supabaseService.getMenuItems(),
        supabaseService.getMenuSizes(),
        supabaseService.getMenuAddons(),
      ])

      setMenuItems(items.filter((item) => item.isAvailable))
      setMenuSizes(sizes.filter((size) => size.isAvailable))
      setMenuAddons(addons.filter((addon) => addon.isAvailable))

      // Set defaults if available
      if (items.length > 0) {
        setTopUpForm((prev) => ({ ...prev, drinkName: items[0].id }))
      }
      if (sizes.length > 0) {
        setTopUpForm((prev) => ({ ...prev, sizeName: sizes[0].id }))
      }
    } catch (error) {
      console.error("Error loading menu data:", error)
    } finally {
      setIsMenuLoading(false)
    }
  }

  const loadTransactions = async () => {
    if (!customer) return

    setIsLoading(true)
    try {
      const customerTransactions = await supabaseService.getCustomerTransactions(customer.id)
      setTransactions(customerTransactions)
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!customer) return

    setIsSaving(true)
    try {
      const updatedCustomer = await supabaseService.updateCustomer(customer.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone || undefined,
        status: editForm.status,
        notificationLowBalance: editForm.notificationLowBalance,
        notificationTopup: editForm.notificationTopup,
      })

      onCustomerUpdate?.(updatedCustomer)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating customer:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
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
    }
    setIsEditing(false)
    setAuthEmailSent(false)
    setAuthError("")
  }

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!customer) return false

    try {
      // Search for customers with this email, excluding the current customer
      const customers = await supabaseService.searchCustomers(email)
      return customers.some((c) => c.email === email && c.id !== customer.id)
    } catch (error) {
      console.error("Error checking email existence:", error)
      return false
    }
  }

  const handleSendAuthEmail = async () => {
    if (!editForm.email || !customer) return

    setIsSendingAuth(true)
    setAuthError("")

    try {
      // First, check if email already exists in customers table (excluding current customer)
      if (editForm.email !== customer.email) {
        const emailExists = await checkEmailExists(editForm.email)
        if (emailExists) {
          setAuthError("This email is already associated with another customer. Please use a different email address.")
          setIsSendingAuth(false)
          return
        }

        // Update the customer with the new email
        await supabaseService.updateCustomer(customer.id, {
          email: editForm.email,
        })

        // Update the customer object for the parent component
        const updatedCustomer = { ...customer, email: editForm.email }
        onCustomerUpdate?.(updatedCustomer)
      }

      // Use the auth context to create the account
      const { createClient } = await import("@supabase/supabase-js")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Check if user already exists in auth
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
          console.error("Error checking existing users:", listError)
          // If we can't check, proceed with signup attempt
        }

        const existingUser = existingUsers?.users?.find((user) => user.email === editForm.email)

        if (existingUser) {
          // User already exists, just send password reset email
          console.log("User already exists, sending password reset email")

          const { error: resetError } = await supabase.auth.resetPasswordForEmail(editForm.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (resetError) {
            console.error("Password reset email error:", resetError)
            throw resetError
          }
        } else {
          // Create new user
          const tempPassword = Math.random().toString(36).slice(-12) + "A1!"

          const { data, error } = await supabase.auth.signUp({
            email: editForm.email,
            password: tempPassword,
            options: {
              data: {
                first_name: editForm.firstName,
                last_name: editForm.lastName,
              },
            },
          })

          if (error) {
            console.error("Auth creation error:", error)
            throw error
          }

          // Send password reset email so user can set their own password
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(editForm.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })

          if (resetError) {
            console.error("Password reset email error:", resetError)
            throw resetError
          }
        }

        setAuthEmailSent(true)
        console.log("✅ Authentication setup email sent to:", editForm.email)
      }
    } catch (error) {
      console.error("Error setting up authentication:", error)

      // Handle specific error cases
      if (error.message?.includes("duplicate key")) {
        setAuthError("This email is already associated with another customer. Please use a different email address.")
      } else if (error.message?.includes("Invalid email")) {
        setAuthError("Please enter a valid email address.")
      } else {
        setAuthError("Failed to setup authentication. Please try again or contact support.")
      }
    } finally {
      setIsSendingAuth(false)
    }
  }

  const handleServeCoffee = async () => {
    if (!customer || !user || isServing) return

    setIsServing(true)
    try {
      // Find the most recent top-up transaction to use its details
      const topUpTransactions = transactions.filter((t) => t.type === "topup")
      const latestTopUp = topUpTransactions.length > 0 ? topUpTransactions[0] : null

      await supabaseService.createTransaction({
        customerId: customer.id,
        adminId: user.id,
        type: "serve",
        coffeeCount: 1,
        amount: 0, // No amount charged since it's using pre-paid credits
        drinkName: latestTopUp?.drinkName || "Coffee",
        sizeName: latestTopUp?.sizeName || "Regular",
        addons: latestTopUp?.addons || [],
        notes: "",
        description: `Served: ${latestTopUp?.drinkName || "Coffee"} (${latestTopUp?.sizeName || "Regular"})`,
      })

      // Refresh customer data and transactions
      const updatedCustomer = await supabaseService.getCustomer(customer.id)
      if (updatedCustomer) {
        onCustomerUpdate?.(updatedCustomer)
      }
      await loadTransactions()
    } catch (error) {
      console.error("Error serving coffee:", error)
    } finally {
      setIsServing(false)
    }
  }

  const handleTopUp = async () => {
    if (!customer || !user) return

    setIsTopUp(true)
    try {
      // Get selected items from menu
      const selectedDrink = menuItems.find((item) => item.id === topUpForm.drinkName)
      const selectedSize = menuSizes.find((s) => s.id === topUpForm.sizeName)
      const selectedAddonNames = topUpForm.addons
        .map((addonId) => {
          const addon = menuAddons.find((a) => a.id === addonId)
          return addon?.name || ""
        })
        .filter((name) => name)

      await supabaseService.createTransaction({
        customerId: customer.id,
        adminId: user.id,
        type: "topup",
        coffeeCount: topUpForm.coffeeCount,
        drinkName: selectedDrink?.name,
        sizeName: selectedSize?.name,
        addons: selectedAddonNames,
        discountAmount: topUpForm.discountAmount,
        notes: topUpForm.notes,
        description: `Top-up: ${topUpForm.coffeeCount} coffee${topUpForm.coffeeCount !== 1 ? "s" : ""} - ${selectedDrink?.name || "Coffee"} (${selectedSize?.name || "Regular"})`,
      })

      // Refresh customer data and transactions
      const updatedCustomer = await supabaseService.getCustomer(customer.id)
      if (updatedCustomer) {
        onCustomerUpdate?.(updatedCustomer)
      }
      await loadTransactions()

      // Reset form
      setTopUpForm({
        coffeeCount: 1,
        notes: "",
        drinkName: menuItems.length > 0 ? menuItems[0].id : "",
        sizeName: menuSizes.length > 0 ? menuSizes[0].id : "",
        addons: [],
        discountAmount: 0,
      })
    } catch (error) {
      console.error("Error topping up:", error)
    } finally {
      setIsTopUp(false)
    }
  }

  const handleAddonToggle = (addonId: string) => {
    setTopUpForm((prev) => ({
      ...prev,
      addons: prev.addons.includes(addonId) ? prev.addons.filter((id) => id !== addonId) : [...prev.addons, addonId],
    }))
  }

  const calculateTopUpTotal = () => {
    // Base price from selected drink
    const selectedDrink = menuItems.find((item) => item.id === topUpForm.drinkName)
    let basePrice = selectedDrink?.basePrice || pricingConfig.defaultCoffeePrice

    // Apply size modifier
    const selectedSize = menuSizes.find((s) => s.id === topUpForm.sizeName)
    if (selectedSize) {
      basePrice += selectedSize.priceModifier
    }

    // Add addon prices
    const addonTotal = topUpForm.addons.reduce((total, addonId) => {
      const addon = menuAddons.find((a) => a.id === addonId)
      return total + (addon?.price || 0)
    }, 0)

    const subtotal = (basePrice + addonTotal) * topUpForm.coffeeCount
    const discountAmount = topUpForm.discountAmount || 0
    return Math.max(0, subtotal - discountAmount)
  }

  if (!customer) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getBalanceStatus = (balance: number) => {
    if (balance === 0) return { color: "destructive", text: "Empty" }
    if (balance <= 2) return { color: "secondary", text: "Low" }
    if (balance <= 5) return { color: "default", text: "Medium" }
    return { color: "default", text: "Good" }
  }

  const balanceStatus = getBalanceStatus(customer.balance)

  // Check if email is valid for authentication setup
  const isValidEmail = editForm.email && editForm.email.includes("@") && editForm.email.includes(".")
  const hasEmailChanged = editForm.email !== customer.email
  const canSetupAuth = isValidEmail && (hasEmailChanged || !customer.email)

  // If editing, show only the edit form
  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Edit Customer Profile</DialogTitle>
                <p className="text-sm text-muted-foreground">Update customer information</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => {
                          setEditForm((prev) => ({ ...prev, email: e.target.value }))
                          setAuthEmailSent(false) // Reset auth email sent status when email changes
                          setAuthError("") // Clear any previous errors
                        }}
                        placeholder="Email address"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendAuthEmail}
                        disabled={!canSetupAuth || isSendingAuth || authEmailSent}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap bg-transparent"
                      >
                        {isSendingAuth ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : authEmailSent ? (
                          <Mail className="h-4 w-4 mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        {authEmailSent ? "Email Sent" : "Setup Auth"}
                      </Button>
                    </div>

                    {/* Success Message */}
                    {authEmailSent && !authError && (
                      <p className="text-sm text-green-600 mt-1">
                        ✅ Authentication setup email sent to {editForm.email}. Customer can now set their password and
                        login.
                      </p>
                    )}

                    {/* Error Message */}
                    {authError && (
                      <div className="flex items-center text-red-600 text-sm mt-1 p-2 bg-red-50 rounded-md">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* Help Text */}
                    {canSetupAuth && !authEmailSent && !authError && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Click "Setup Auth" to send authentication setup email to this customer.
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
                      value={editForm.phone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setEditForm((prev) => ({ ...prev, status: value }))
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
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="low-balance-edit">Low Balance Notifications</Label>
                      <Switch
                        id="low-balance-edit"
                        checked={editForm.notificationLowBalance}
                        onCheckedChange={(checked) =>
                          setEditForm((prev) => ({ ...prev, notificationLowBalance: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="topup-edit">Top-up Notifications</Label>
                      <Switch
                        id="topup-edit"
                        checked={editForm.notificationTopup}
                        onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, notificationTopup: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {customer.firstName} {customer.lastName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">{customer.email || "No email set"}</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Combined Coffee Balance and Serve Coffee Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coffee Balance & Service</CardTitle>
                <Coffee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-3">
                  {/* Coffee Balance Display */}
                  <div className="flex items-center justify-center space-x-3">
                    <div className="text-4xl font-bold">{customer.balance}</div>
                    <Badge variant={balanceStatus.color as any} className="text-sm">
                      {balanceStatus.text}
                    </Badge>
                  </div>
                  <p className="text-base text-muted-foreground">
                    {customer.balance === 1 ? "coffee remaining" : "coffees remaining"}
                  </p>

                  {/* Visit Count */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{customer.visitCount} total visits</span>
                  </div>

                  {/* Serve Button */}
                  <Button
                    onClick={handleServeCoffee}
                    disabled={isServing || customer.balance < 1}
                    className="w-full h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    {isServing ? (
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    ) : (
                      <Coffee className="h-6 w-6 mr-3" />
                    )}
                    {customer.balance < 1 ? "Insufficient Balance" : "SERVE COFFEE"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Details</span>
                </CardTitle>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm flex-1">{customer.email || "Not provided"}</p>
                      {!customer.email && (
                        <Badge variant="secondary" className="text-xs">
                          No Auth
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </Label>
                    <p className="text-sm">{customer.phone || "Not provided"}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member Since</span>
                    </Label>
                    <p className="text-sm">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Low Balance Notifications</Label>
                      <Badge variant={customer.notificationLowBalance ? "default" : "secondary"}>
                        {customer.notificationLowBalance ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Top-up Notifications</Label>
                      <Badge variant={customer.notificationTopup ? "default" : "secondary"}>
                        {customer.notificationTopup ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {customer.lastVisit && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Last Visit</Label>
                      <p className="text-sm">{formatDate(customer.lastVisit)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Transaction History</span>
                </CardTitle>
                <CardDescription>Recent coffee transactions for this customer</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "topup"
                                ? "bg-green-100 text-green-600"
                                : transaction.type === "serve"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            <Coffee className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                            {transaction.notes && (
                              <p className="text-xs text-muted-foreground italic">{transaction.notes}</p>
                            )}
                            {transaction.discountAmount && transaction.discountAmount > 0 && (
                              <p className="text-xs text-green-600 font-medium">
                                Discount Applied: -${transaction.discountAmount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                transaction.type === "topup"
                                  ? "default"
                                  : transaction.type === "serve"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {transaction.type === "topup" ? "+" : transaction.type === "serve" ? "-" : "+"}
                              {transaction.coffeeCount}
                            </Badge>
                            {transaction.amount && (
                              <span className="text-sm font-medium">${transaction.amount.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            {/* Top Up */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Add Coffee Credits</span>
                </CardTitle>
                <CardDescription>Add coffee credits to this customer's account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isMenuLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading menu options...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Drink Type</Label>
                        <Select
                          value={topUpForm.drinkName}
                          onValueChange={(value) => setTopUpForm((prev) => ({ ...prev, drinkName: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select drink type" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - ${item.basePrice.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select
                          value={topUpForm.sizeName}
                          onValueChange={(value) => setTopUpForm((prev) => ({ ...prev, sizeName: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuSizes.map((size) => (
                              <SelectItem key={size.id} value={size.id}>
                                {size.name} {size.priceModifier > 0 && `(+$${size.priceModifier.toFixed(2)})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Add-ons</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {menuAddons.map((addon) => (
                          <div key={addon.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`topup-addon-${addon.id}`}
                              checked={topUpForm.addons.includes(addon.id)}
                              onCheckedChange={() => handleAddonToggle(addon.id)}
                            />
                            <Label htmlFor={`topup-addon-${addon.id}`} className="text-sm cursor-pointer">
                              {addon.name} (+${addon.price.toFixed(2)})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Number of Coffees</Label>
                        <Select
                          value={topUpForm.coffeeCount.toString()}
                          onValueChange={(value) =>
                            setTopUpForm((prev) => ({ ...prev, coffeeCount: Number.parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 10, 15, 20].map((count) => (
                              <SelectItem key={count} value={count.toString()}>
                                {count} Coffee{count !== 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <Percent className="h-4 w-4" />
                          <span>Discount Amount ($)</span>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={topUpForm.discountAmount.toString()}
                          onChange={(e) =>
                            setTopUpForm((prev) => ({
                              ...prev,
                              discountAmount: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Input
                        value={topUpForm.notes}
                        onChange={(e) => setTopUpForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any notes about this top-up..."
                      />
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Subtotal:</span>
                          <span className="text-sm">
                            ${(calculateTopUpTotal() + (topUpForm.discountAmount || 0)).toFixed(2)}
                          </span>
                        </div>
                        {topUpForm.discountAmount > 0 && (
                          <div className="flex justify-between items-center text-green-600">
                            <span className="text-sm">Discount:</span>
                            <span className="text-sm">-${topUpForm.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total:</span>
                          <span className="text-lg font-bold">${calculateTopUpTotal().toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {topUpForm.coffeeCount} coffee{topUpForm.coffeeCount !== 1 ? "s" : ""}
                          with selected options
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleTopUp}
                      disabled={isTopUp}
                      className="w-full bg-transparent"
                      variant="outline"
                    >
                      {isTopUp ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Add {topUpForm.coffeeCount} Coffee{topUpForm.coffeeCount !== 1 ? "s" : ""}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
