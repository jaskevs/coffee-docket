"use client"

import { useState, useEffect } from "react"
import { Coffee, User, RefreshCw, AlertCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CustomerTransactionHistory } from "./customer-transaction-history"
import { supabaseService } from "@/lib/supabase-service"
import type { Customer } from "@/lib/supabase-service"

interface CustomerDashboardProps {
  userEmail: string
}

export function CustomerDashboard({ userEmail }: CustomerDashboardProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadCustomerData()
  }, [userEmail])

  const loadCustomerData = async () => {
    if (!userEmail) {
      setError("No user email provided")
      setIsLoading(false)
      return
    }

    try {
      console.log("🔄 Loading customer data for email:", userEmail)
      setError(null)

      const customerData = await supabaseService.getCustomerByEmail(userEmail)

      if (customerData) {
        console.log("✅ Customer data loaded:", customerData)
        setCustomer(customerData)
      } else {
        console.log("❌ No customer found for email:", userEmail)
        setError("Customer profile not found. Please contact support.")
      }
    } catch (err) {
      console.error("❌ Error loading customer data:", err)
      setError("Failed to load customer data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadCustomerData()
    setIsRefreshing(false)
  }

  const getBalanceStatus = (balance: number) => {
    if (balance === 0) return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", status: "Empty" }
    if (balance <= 3) return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", status: "Low" }
    return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", status: "Good" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your coffee dashboard...</p>
          <p className="text-sm text-gray-500 mt-1">Email: {userEmail}</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Customer data not available"}</AlertDescription>
          </Alert>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Searching for: <strong>{userEmail}</strong>
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing} className="w-full">
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const balanceStatus = getBalanceStatus(customer.balance)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {customer.firstName}!</h1>
            <p className="text-gray-600 mt-1">Manage your coffee balance and view your activity</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Combined Coffee Balance & Info Card */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            {/* Main Coffee Balance Section */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${balanceStatus.color} ${balanceStatus.bg} ${balanceStatus.border} border`}>
                  {balanceStatus.status} Balance
                </Badge>
                <div className="bg-white/20 p-2 rounded-full">
                  <Coffee className="w-6 h-6" />
                </div>
              </div>

              <div className="text-center">
                <div className="text-5xl sm:text-6xl font-bold mb-2 tabular-nums">{customer.balance}</div>
                <p className="text-blue-100 text-lg font-medium">Coffee{customer.balance !== 1 ? "s" : ""} Available</p>
              </div>

              {customer.balance <= 3 && customer.balance > 0 && (
                <div className="mt-4 p-3 bg-amber-500/20 rounded-lg border border-amber-400/30">
                  <p className="text-sm text-center text-amber-100">⚠️ Low balance! Consider asking staff to top up.</p>
                </div>
              )}

              {customer.balance === 0 && (
                <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-400/30">
                  <p className="text-sm text-center text-red-100">
                    ☕ Your balance is empty. Please ask staff to add credits.
                  </p>
                </div>
              )}
            </div>

            {/* Additional Info Section */}
            <div className="bg-white p-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <User className="w-5 h-5 text-gray-400 mb-1" />
                  <div className="text-lg font-semibold text-gray-900">{customer.visitCount || 0}</div>
                  <div className="text-xs text-gray-600">Total Visits</div>
                  {customer.lastVisit && (
                    <div className="text-xs text-gray-500 mt-1">
                      Last: {new Date(customer.lastVisit).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mb-1" />
                  <div className="text-lg font-semibold text-gray-900">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                  <div className="text-xs text-gray-600">Member Since</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Balance Alert */}
        {customer.balance <= 3 && customer.balance > 0 && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Your coffee balance is running low. Consider asking staff to top up your account.
            </AlertDescription>
          </Alert>
        )}

        {customer.balance === 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your coffee balance is empty. Please ask staff to add credits to your account.
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction History */}
        <CustomerTransactionHistory customerId={customer.id} />
      </div>
    </div>
  )
}
