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
import { useSwipeGestures } from "@/hooks/useSwipeGestures"
import { useHapticFeedback } from "@/hooks/useHapticFeedback"

interface CustomerDashboardProps {
  userId: string
  userEmail: string | null
}

export function CustomerDashboard({ userId, userEmail }: CustomerDashboardProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { triggerSuccess, triggerSelection } = useHapticFeedback()
  
  // Swipe gesture for pull-to-refresh
  const swipeRef = useSwipeGestures({
    onSwipeDown: () => {
      if (!isRefreshing) {
        handleRefresh()
      }
    },
    threshold: 100
  })

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
    triggerSelection() // Haptic feedback for refresh
    await loadCustomerData()
    setIsRefreshing(false)
    triggerSuccess() // Haptic feedback for completion
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50" ref={swipeRef}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Welcome back, {customer.firstName}
              </h1>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-3 h-auto ml-4 min-h-[44px] min-w-[44px] active:scale-90 transition-transform duration-150 touch-manipulation"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p className="text-gray-500 text-base font-medium">Manage your coffee balance</p>
        </div>

        {/* Coffee Balance Card */}
        <Card className="mb-8 overflow-hidden relative bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98] touch-manipulation">
          {/* Fun background animations */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-200/60 to-purple-200/40 rounded-full blur-xl animate-bounce" style={{animationDuration: '3s', animationDelay: '0s'}}></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-tr from-green-200/60 to-blue-200/40 rounded-full blur-lg animate-ping" style={{animationDuration: '2s', animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-pink-200/50 to-yellow-200/50 rounded-full blur-md animate-spin" style={{animationDuration: '8s', animationDelay: '0.5s', transform: 'translate(-50%, -50%)'}}></div>
          </div>
          
          <CardContent className="p-6 sm:p-8 text-center relative z-10">
            <div className="flex items-center justify-between mb-6">
              <Badge 
                className={`${balanceStatus.color} ${balanceStatus.bg} ${balanceStatus.border} border-0 font-medium px-3 py-1 shadow-sm`}
              >
                {balanceStatus.status}
              </Badge>
              <div className="p-2 bg-gray-100 rounded-full">
                <Coffee className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-6xl sm:text-7xl font-bold text-gray-900 tabular-nums leading-none">
                {customer.balance}
              </div>
              <p className="text-gray-600 text-xl font-medium">
                Coffee{customer.balance !== 1 ? "s" : ""} Available
              </p>
            </div>

            {customer.balance <= 3 && customer.balance > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50">
                <p className="text-sm text-amber-700 font-medium">
                  Running low! Consider asking staff to top up.
                </p>
              </div>
            )}

            {customer.balance === 0 && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200/50">
                <p className="text-sm text-red-700 font-medium">
                  Balance empty. Please ask staff to add credits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="mb-8 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 transition-all duration-300 hover:shadow-lg active:scale-[0.98] touch-manipulation">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Visits Section */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1 tabular-nums">
                    {customer.visitCount || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Visits</div>
                  {customer.lastVisit && (
                    <div className="text-xs text-gray-500">
                      Last: {new Date(customer.lastVisit).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Member Since Section */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : "N/A"}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Member Since</div>
                </div>
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
