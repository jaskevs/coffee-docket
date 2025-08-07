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
  userId: string
  userEmail: string | null
}

export function CustomerDashboard({ userId, userEmail }: CustomerDashboardProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadCustomerData()
  }, [userId, userEmail])

  const loadCustomerData = async () => {
    if (!userId) {
      setError("No user ID provided")
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      
      // Try to get customer by ID first, then by email if available
      let customerData = await supabaseService.getCustomerById(userId)
      
      if (!customerData && userEmail) {
        customerData = await supabaseService.getCustomerByEmail(userEmail)
      }

      if (customerData) {
        setCustomer(customerData)
      } else {
        setError("Customer profile not found. Please contact support.")
      }
    } catch (err) {
      console.error("Error loading customer data:", err)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-1">
            {userEmail ? `${userEmail}` : 'Loading profile...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          </div>
          
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Customer data not available"}</AlertDescription>
          </Alert>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Looking for: <strong>{userEmail || `User ID: ${userId}`}</strong>
            </p>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              className="w-full"
            >
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
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Welcome back, {customer.firstName}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Manage your coffee balance</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing} 
            variant="ghost" 
            size="sm"
            className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 h-auto"
          >
            <RefreshCw className={`mr-1 h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Coffee Balance Card */}
        <Card className="mb-6 overflow-hidden relative bg-gradient-to-br from-white via-slate-50/30 to-blue-50/40">
          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-slate-50/20 animate-pulse" style={{animationDuration: '4s', animationTimingFunction: 'ease-in-out'}}></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-slate-100/10 to-transparent animate-pulse" style={{animationDuration: '6s', animationTimingFunction: 'ease-in-out', animationDelay: '1s'}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/15 to-transparent animate-pulse" style={{animationDuration: '8s', animationTimingFunction: 'ease-in-out', animationDelay: '2s'}}></div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100/8 via-slate-50/4 to-transparent rounded-full transform translate-x-24 -translate-y-24 animate-pulse" style={{animationDuration: '10s', animationTimingFunction: 'ease-in-out'}}></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-slate-100/6 via-blue-50/3 to-transparent rounded-full transform -translate-x-18 translate-y-18 animate-pulse" style={{animationDuration: '12s', animationTimingFunction: 'ease-in-out', animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-transparent via-slate-50/8 to-transparent rounded-full transform -translate-x-12 -translate-y-12 animate-pulse" style={{animationDuration: '14s', animationTimingFunction: 'ease-in-out', animationDelay: '5s'}}></div>
          <CardContent className="p-6 text-center relative z-10">
            <div className="flex items-center justify-between mb-6">
              <Badge className={`${balanceStatus.color} ${balanceStatus.bg} ${balanceStatus.border} border shadow-sm`}>
                {balanceStatus.status}
              </Badge>
              <Coffee className="w-5 h-5 text-gray-400" />
            </div>

            <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-2 tabular-nums">
              {customer.balance}
            </div>
            <p className="text-gray-600 text-lg mb-4">
              Coffee{customer.balance !== 1 ? "s" : ""} Available
            </p>

            {customer.balance <= 3 && customer.balance > 0 && (
              <div className="mt-4 p-3 bg-amber-50/90 backdrop-blur-sm rounded-xl border border-amber-200/60 shadow-sm">
                <p className="text-sm text-amber-800">
                  Low balance. Consider asking staff to top up.
                </p>
              </div>
            )}

            {customer.balance === 0 && (
              <div className="mt-4 p-3 bg-red-50/90 backdrop-blur-sm rounded-xl border border-red-200/60 shadow-sm">
                <p className="text-sm text-red-800">
                  Balance empty. Please ask staff to add credits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <User className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">{customer.visitCount || 0}</div>
                <div className="text-xs text-gray-600">Total Visits</div>
                {customer.lastVisit && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last: {new Date(customer.lastVisit).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div>
                <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                </div>
                <div className="text-xs text-gray-600">Member Since</div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Transaction History */}
        <CustomerTransactionHistory customerId={customer.id} />
      </div>
    </div>
  )
}
