"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Coffee,
  Loader2,
  X,
  CreditCard,
  History,
  User,
  Phone,
  Calendar,
  TrendingUp,
  Edit3,
  Percent,
  UserPlus,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  supabaseService,
  type Customer,
  type Transaction,
  type TransactionWithAddonNames,
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
  onTransactionUpdate?: () => void
  onEdit?: (customer: Customer) => void
}

export function CustomerDetailsModal({ 
  customer, 
  isOpen, 
  onClose, 
  onCustomerUpdate, 
  onTransactionUpdate, 
  onEdit 
}: CustomerDetailsModalProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionWithAddonNames[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Coffee serving state
  const [isServing, setIsServing] = useState(false)
  const servingRef = useRef(false)

  // Top-up state
  const [topUpForm, setTopUpForm] = useState({
    coffeeCount: 1,
    discount: 0,
    notes: ""
  })
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false)
  

  // Coffee serving state
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [selectedSize, setSelectedSize] = useState<MenuSize | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuSizes, setMenuSizes] = useState<MenuSize[]>([])
  const [menuAddons, setMenuAddons] = useState<MenuAddon[]>([])

  useEffect(() => {
    if (customer && isOpen) {
      loadTransactions()
      loadMenuData()
    }
  }, [customer, isOpen])

  const loadTransactions = async () => {
    if (!customer) return

    setIsLoading(true)
    try {
      const customerTransactions = await supabaseService.getTransactionsWithAddonNames(customer.id)
      setTransactions(customerTransactions)
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMenuData = async () => {
    try {
      const [items, sizes, addons] = await Promise.all([
        supabaseService.getMenuItems(),
        supabaseService.getMenuSizes(),
        supabaseService.getMenuAddons(),
      ])
      setMenuItems(items)
      setMenuSizes(sizes)
      setMenuAddons(addons)
    } catch (error) {
      console.error("Error loading menu data:", error)
    }
  }

  const calculateOrderTotal = () => {
    if (!selectedMenuItem || !selectedSize) return 0

    let total = selectedMenuItem.basePrice + selectedSize.priceModifier
    
    selectedAddons.forEach(addonId => {
      const addon = menuAddons.find(a => a.id === addonId)
      if (addon) total += addon.priceModifier
    })

    return total
  }

  const handleServeCoffee = async () => {
    if (!customer || servingRef.current || customer.balance < 1) return

    servingRef.current = true
    setIsServing(true)
    
    try {
      // Create transaction record for serving 1 coffee
      await supabaseService.createTransaction({
        customerId: customer.id,
        type: "serve",
        coffeeCount: 1,
        description: "Coffee served",
      })

      // Update customer balance (decrease by 1 coffee)
      const updatedCustomer = await supabaseService.updateCustomer(customer.id, {
        balance: customer.balance - 1,
      })

      if (onCustomerUpdate) {
        onCustomerUpdate(updatedCustomer)
      }

      if (onTransactionUpdate) {
        onTransactionUpdate()
      }

      // Reload transactions
      await loadTransactions()
      
      // Add delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error serving coffee:", error)
    } finally {
      setIsServing(false)
      servingRef.current = false
    }
  }

  const handleTopUp = async () => {
    if (!customer || !selectedMenuItem || !selectedSize || topUpForm.coffeeCount < 1) return

    setIsProcessingTopUp(true)
    try {
      // Calculate total amount
      const perCoffeePrice = calculateOrderTotal()
      const totalAmount = (perCoffeePrice * topUpForm.coffeeCount) * (1 - topUpForm.discount / 100)
      
      // Create drink name with size and addons
      const selectedAddonNames = selectedAddons
        .map(id => menuAddons.find(a => a.id === id)?.name)
        .filter((name): name is string => Boolean(name))
      
      const drinkName = `${selectedSize.displayName} ${selectedMenuItem.name}`
      
      // Create transaction record
      await supabaseService.createTransaction({
        customerId: customer.id,
        type: "topup",
        coffeeCount: topUpForm.coffeeCount,
        amount: totalAmount,
        drinkName: drinkName,
        sizeName: selectedSize.displayName,
        addons: selectedAddons, // Store addon IDs instead of names
        discountAmount: (perCoffeePrice * topUpForm.coffeeCount) * (topUpForm.discount / 100),
        notes: topUpForm.notes,
        description: `Top-up: ${topUpForm.coffeeCount} x ${drinkName}${selectedAddonNames.length > 0 ? ` with ${selectedAddonNames.join(", ")}` : ""}`,
      })

      // Update customer balance (add coffee count) and total spent
      const updatedCustomer = await supabaseService.updateCustomer(customer.id, {
        balance: customer.balance + topUpForm.coffeeCount,
        totalSpent: customer.totalSpent + totalAmount,
      })

      if (onCustomerUpdate) {
        onCustomerUpdate(updatedCustomer)
      }

      if (onTransactionUpdate) {
        onTransactionUpdate()
      }

      // Reset form
      setTopUpForm({ coffeeCount: 1, discount: 0, notes: "" })
      setSelectedMenuItem(null)
      setSelectedSize(null)
      setSelectedAddons([])
      
      await loadTransactions()
    } catch (error) {
      console.error("Error processing top-up:", error)
    } finally {
      setIsProcessingTopUp(false)
    }
  }

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }


  if (!customer) return null

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Coffee Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coffee className="h-5 w-5" />
                  <span>Coffee Balance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {customer.balance}
                </div>
                <p className="text-xl font-semibold mb-2">
                  Coffee{customer.balance === 1 ? '' : 's'} Available
                </p>
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <p>Visit Count: {customer.visitCount || 0}</p>
                  <p>Last Visit: {customer.lastVisit ? formatDate(customer.lastVisit) : "Never"}</p>
                  <p>Last updated: {formatDate(customer.updatedAt)}</p>
                </div>
                {customer.balance < 3 && (
                  <Badge variant="destructive" className="mb-4">Low Balance</Badge>
                )}
              </CardContent>
            </Card>

            {/* Serve Coffee Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleServeCoffee}
                  disabled={customer.balance < 1 || isServing}
                  className={`
                    w-full h-20 text-xl font-bold text-white
                    transition-all duration-300 ease-in-out
                    transform active:scale-95
                    ${isServing 
                      ? "bg-orange-500 hover:bg-orange-600 shadow-lg scale-105" 
                      : customer.balance < 1
                        ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" 
                        : "bg-red-600 hover:bg-red-700 hover:scale-102 hover:shadow-lg"
                    }
                  `}
                >
                  {isServing ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Serving Coffee...
                    </>
                  ) : customer.balance < 1 ? (
                    "No Coffee Available"
                  ) : (
                    <>
                      <Coffee className="mr-3 h-6 w-6" />
                      Serve Coffee
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="topup" className="space-y-6">
            {/* Top-up Menu Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Buy Coffee in Bulk</CardTitle>
                <CardDescription>Select coffee options and quantity for customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coffee Type and Size - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Coffee Type</Label>
                    <Select
                      value={selectedMenuItem?.id || ""}
                      onValueChange={(value) => {
                        const item = menuItems.find(i => i.id === value)
                        setSelectedMenuItem(item || null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a coffee" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {formatCurrency(item.basePrice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Select
                      value={selectedSize?.id || ""}
                      onValueChange={(value) => {
                        const size = menuSizes.find(s => s.id === value)
                        setSelectedSize(size || null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuSizes.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.displayName} (+{formatCurrency(size.priceModifier)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Add-ons */}
                <div className="space-y-2">
                  <Label>Add-ons (optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {menuAddons.map((addon) => (
                      <div key={addon.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`addon-${addon.id}`}
                          checked={selectedAddons.includes(addon.id)}
                          onChange={() => handleAddonToggle(addon.id)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`addon-${addon.id}`} className="text-sm">
                          {addon.name} (+{formatCurrency(addon.priceModifier)})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Number of Coffees and Discount % - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Coffees</Label>
                    <Input
                      type="number"
                      min="1"
                      value={topUpForm.coffeeCount}
                      onChange={(e) => setTopUpForm(prev => ({ 
                        ...prev, 
                        coffeeCount: parseInt(e.target.value) || 1 
                      }))}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={topUpForm.discount}
                      onChange={(e) => setTopUpForm(prev => ({ 
                        ...prev, 
                        discount: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="Enter discount percentage"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Input
                    value={topUpForm.notes}
                    onChange={(e) => setTopUpForm(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                    placeholder="Add any notes"
                  />
                </div>

                {/* Order Summary */}
                {selectedMenuItem && selectedSize && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Per Coffee Price:</span>
                      <span>{formatCurrency(calculateOrderTotal())}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Quantity:</span>
                      <span>{topUpForm.coffeeCount} coffee{topUpForm.coffeeCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateOrderTotal() * topUpForm.coffeeCount)}</span>
                    </div>
                    {topUpForm.discount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount ({topUpForm.discount}%):</span>
                        <span>-{formatCurrency((calculateOrderTotal() * topUpForm.coffeeCount) * (topUpForm.discount / 100))}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(
                        (calculateOrderTotal() * topUpForm.coffeeCount) * (1 - topUpForm.discount / 100)
                      )}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top-up Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleTopUp}
                  disabled={!selectedMenuItem || !selectedSize || isProcessingTopUp || topUpForm.coffeeCount < 1}
                  className={`
                    w-full h-16 text-lg font-semibold text-white
                    transition-all duration-300 ease-in-out
                    transform active:scale-95
                    ${isProcessingTopUp 
                      ? "bg-green-500 hover:bg-green-600 shadow-lg scale-105" 
                      : !selectedMenuItem || !selectedSize || topUpForm.coffeeCount < 1
                        ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" 
                        : "bg-green-600 hover:bg-green-700 hover:scale-102 hover:shadow-lg"
                    }
                  `}
                >
                  {isProcessingTopUp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : !selectedMenuItem || !selectedSize ? (
                    "Select Coffee & Size"
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Add {topUpForm.coffeeCount} Coffee{topUpForm.coffeeCount > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
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
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 20).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {transaction.type === "serve" ? (
                            <Coffee className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          <div>
                            <div className="font-medium">
                              {transaction.type === "serve" ? "Coffee Served" : "Coffee Top-up"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.description || transaction.drinkName || "Coffee purchase"}
                              {transaction.addons && transaction.addons.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Add-ons: {transaction.addons.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            transaction.type === "serve" ? "text-red-600" : "text-green-600"
                          }`}>
                            {transaction.type === "serve" 
                              ? `-1 Coffee` 
                              : `+${transaction.coffeeCount || 1} Coffee${(transaction.coffeeCount || 1) > 1 ? 's' : ''}`
                            }
                          </div>
                          {transaction.amount && transaction.type === "topup" && (
                            <div className="text-sm text-green-600 font-medium">
                              {formatCurrency(transaction.amount)}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer Details</span>
                </CardTitle>
                <Button onClick={() => onEdit?.(customer)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <div className="px-3 py-2 border rounded-md bg-muted">
                      {customer.firstName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <div className="px-3 py-2 border rounded-md bg-muted">
                      {customer.lastName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="px-3 py-2 border rounded-md bg-muted">
                      {customer.email || "No email set"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="px-3 py-2 border rounded-md bg-muted">
                      {customer.phone || "No phone number"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="px-3 py-2 border rounded-md bg-muted">
                      {formatDate(customer.createdAt)}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base font-medium">Notification Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Low Balance Notifications</span>
                      <Badge variant={customer.notificationLowBalance ? "default" : "secondary"}>
                        {customer.notificationLowBalance ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Top-up Notifications</span>
                      <Badge variant={customer.notificationTopup ? "default" : "secondary"}>
                        {customer.notificationTopup ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  )
}