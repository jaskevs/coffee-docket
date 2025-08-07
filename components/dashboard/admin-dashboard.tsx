"use client"

import { useState, useEffect } from "react"
import { FileText, Users, Menu, Clock, ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerCard } from "./customer-card"
import { CustomerDetailsModal } from "./customer-details-modal"
import { CustomerEditModal } from "./customer-edit-modal"
import { CustomerSearch } from "./customer-search"
import { AddCustomerModal } from "@/components/admin/add-customer-modal"
import { useDebouncedSearch } from "@/hooks/use-debounced-search"
import { supabaseService } from "@/lib/supabase-service"
import type { Customer } from "@/lib/supabase-service"

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalCredits: 0,
    lowBalanceCustomers: 0,
    totalRevenue: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  // Use the debounced search hook
  const { searchQuery, setSearchQuery, filteredCustomers, isSearching, clearSearch, hasQuery } =
    useDebouncedSearch(customers)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load customers
      const customersData = await supabaseService.getCustomers()
      setCustomers(customersData)

      // Load statistics
      const statistics = await supabaseService.getStatistics()
      const activeCustomers = customersData.filter((c) => c.status === "active").length
      const lowBalanceCustomers = customersData.filter((c) => c.balance <= 2).length

      // Get today's transactions for revenue
      const allTransactions = await supabaseService.getTransactions()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayTransactions = allTransactions.filter((t) => {
        const transactionDate = new Date(t.createdAt)
        return transactionDate >= today
      })

      const totalRevenue = todayTransactions.filter((t) => t.type === "topup").reduce((sum, t) => sum + (t.amount || 0), 0)

      setStats({
        totalCustomers: statistics.totalCustomers,
        activeCustomers,
        totalCredits: Math.round(statistics.totalBalance),
        lowBalanceCustomers,
        totalRevenue,
      })

      // Load recent transactions
      const recentTxns = allTransactions.slice(0, 4)
      setRecentTransactions(recentTxns)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
  }

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
    setSelectedCustomer(updatedCustomer)
  }

  const handleCustomerAdded = () => {
    loadData()
    setIsAddCustomerModalOpen(false)
  }

  const handleTransactionUpdate = async () => {
    try {
      // Reload recent transactions only
      const allTransactions = await supabaseService.getTransactions()
      const recentTxns = allTransactions.slice(0, 4)
      setRecentTransactions(recentTxns)
    } catch (error) {
      console.error("Error refreshing recent transactions:", error)
    }
  }

  const handleCustomerDelete = (deletedCustomerId: string) => {
    // Remove the customer from the list
    setCustomers((prev) => prev.filter((c) => c.id !== deletedCustomerId))
    
    // Close modals if the deleted customer was selected
    if (selectedCustomer?.id === deletedCustomerId) {
      setSelectedCustomer(null)
      setIsModalOpen(false)
      setIsEditModalOpen(false)
    }
    
    // Refresh data to update stats
    loadData()
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(false) // Close details modal
    setIsEditModalOpen(true) // Open edit modal
  }

  const handleEditSave = (updatedCustomer: Customer) => {
    // Update the customer in the list
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
    setSelectedCustomer(updatedCustomer)
    
    // Close edit modal and reopen details modal
    setIsEditModalOpen(false)
    setIsModalOpen(true)
  }

  const handleEditClose = () => {
    setIsEditModalOpen(false)
    // Reopen details modal if there's a selected customer
    if (selectedCustomer) {
      setIsModalOpen(true)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Left Side - Customer Management (70%) */}
      <div className="flex-1 flex flex-col" style={{ width: "70%" }}>
        {/* Fixed Search Header */}
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
          <CustomerSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={clearSearch}
            resultCount={filteredCustomers.length}
            totalCount={customers.length}
            isSearching={isSearching}
            hasQuery={hasQuery}
          />
        </div>

        {/* Scrollable Customer Results */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="space-y-6">
            {/* Customer Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse transform hover:scale-[1.02] transition-all duration-300">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse transform transition-all duration-500 ease-in-out">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm opacity-60">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full w-20 animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded mr-2 animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded mr-2 animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 transition-all duration-300 ease-in-out ${
                  hasQuery ? "animate-fadeIn" : ""
                }`}
              >
                {filteredCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="animate-slideUp"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <CustomerCard customer={customer} onClick={() => handleCustomerClick(customer)} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isSearching && filteredCustomers.length === 0 && hasQuery && (
              <div className="text-center py-12 animate-fadeIn">
                <div className="bg-gray-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 transform hover:scale-105 transition-transform duration-200">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600 text-sm mb-4">We couldn't find any customers matching "{searchQuery}"</p>
                {/* <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent hover:scale-105 transition-all duration-200"
                >
                  Clear search
                </Button> */}
              </div>
            )}

            {/* No customers at all */}
            {!isLoading && !isSearching && filteredCustomers.length === 0 && !hasQuery && (
              <div className="text-center py-12 animate-fadeIn">
                <div className="bg-gray-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 transform hover:scale-105 transition-transform duration-200">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                <p className="text-gray-600 text-sm mb-4">Start by adding your first customer</p>
                <Button
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all duration-200"
                >
                  Add Customer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Navigation & Activity (30%) */}
      <div className="w-[30%] bg-white border-l border-gray-200 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Navigation Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => onNavigate("admin-transactions")}
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <FileText className="mr-3 h-5 w-5" />
              Transactions
            </Button>

            <Button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Users className="mr-3 h-5 w-5" />
              New Customer
            </Button>

            <Button
              onClick={() => onNavigate("menu-management")}
              className="w-full justify-start bg-slate-600 hover:bg-slate-700 text-white"
              size="lg"
            >
              <Menu className="mr-3 h-5 w-5" />
              Menu Management
            </Button>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="text-sm font-medium">{stats.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Customers</span>
                <span className="text-sm font-medium">{stats.activeCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Credits</span>
                <span className="text-sm font-medium">{stats.totalCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Balance</span>
                <span className="text-sm font-medium text-red-600">{stats.lowBalanceCustomers}</span>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Today</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(stats.totalRevenue)}</span>
              </div> */}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTransactions.length > 0 ? (
                <>
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 truncate">{transaction.customerName}</span>
                          <Badge
                            variant={transaction.type === "serve" ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {transaction.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.description} • {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      {/* <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div> */}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate("admin-transactions")}
                    className="w-full mt-4 justify-center"
                  >
                    View All Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onCustomerUpdate={handleCustomerUpdate}
          onTransactionUpdate={handleTransactionUpdate}
          onEdit={handleEditCustomer}
        />
      )}

      {/* Customer Edit Modal */}
      {selectedCustomer && (
        <CustomerEditModal
          customer={selectedCustomer}
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          onSave={handleEditSave}
          onDelete={handleCustomerDelete}
        />
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  )
}
