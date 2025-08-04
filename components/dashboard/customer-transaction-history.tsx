"use client"

import { useState, useEffect } from "react"
import { Coffee, Plus, Minus, Filter, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabaseService } from "@/lib/supabase-service"
import type { Transaction } from "@/lib/supabase-service"

interface CustomerTransactionHistoryProps {
  customerId: string
}

export function CustomerTransactionHistory({ customerId }: CustomerTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    loadTransactions()
  }, [customerId])

  useEffect(() => {
    filterTransactions()
  }, [transactions, filterType])

  const loadTransactions = async () => {
    if (!customerId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("🔄 Loading transactions for customer:", customerId)
      const data = await supabaseService.getCustomerTransactions(customerId)
      console.log("✅ Loaded transactions:", data)
      setTransactions(data)
    } catch (err) {
      console.error("❌ Error loading transactions:", err)
      setError("Failed to load transaction history")
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    if (filterType === "all") {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter((t) => t.type === filterType))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <Plus className="w-4 h-4" />
      case "serve":
        return <Coffee className="w-4 h-4" />
      case "refund":
        return <Minus className="w-4 h-4" />
      default:
        return <Coffee className="w-4 h-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "topup":
        return "bg-green-100 text-green-600"
      case "serve":
        return "bg-red-100 text-red-600"
      case "refund":
        return "bg-blue-100 text-blue-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getTransactionSummary = () => {
    const topups = transactions.filter((t) => t.type === "topup")
    const serves = transactions.filter((t) => t.type === "serve")
    const refunds = transactions.filter((t) => t.type === "refund")

    const totalCoffeesAdded = topups.reduce((sum, t) => sum + t.coffeeCount, 0)
    const totalCoffeesServed = serves.reduce((sum, t) => sum + t.coffeeCount, 0)
    const totalCoffeesRefunded = refunds.reduce((sum, t) => sum + t.coffeeCount, 0)
    const totalMoneySpent = serves.reduce((sum, t) => sum + (t.amount || 0), 0)

    return {
      totalCoffeesAdded,
      totalCoffeesServed,
      totalCoffeesRefunded,
      totalMoneySpent,
    }
  }

  const summary = getTransactionSummary()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading transaction history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadTransactions} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Transaction History
            <Badge variant="outline" className="ml-2">
              {filteredTransactions.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="topup">Top-ups</SelectItem>
                <SelectItem value="serve">Served</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{summary.totalCoffeesAdded}</div>
              <div className="text-xs text-gray-600">Coffees Added</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{summary.totalCoffeesServed}</div>
              <div className="text-xs text-gray-600">Coffees Served</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{summary.totalCoffeesRefunded}</div>
              <div className="text-xs text-gray-600">Coffees Refunded</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalMoneySpent)}</div>
              <div className="text-xs text-gray-600">Total Spent</div>
            </div>
          </div>
        )}

        {/* Transaction List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}
                  >
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatDate(transaction.createdAt)}</span>
                      {transaction.drinkName && <span>• {transaction.drinkName}</span>}
                      {transaction.sizeName && <span>• {transaction.sizeName}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end space-y-1">
                    <Badge
                      variant={
                        transaction.type === "topup"
                          ? "default"
                          : transaction.type === "serve"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {transaction.type === "topup" ? "+" : "-"}
                      {transaction.coffeeCount} coffee{transaction.coffeeCount !== 1 ? "s" : ""}
                    </Badge>
                    {transaction.amount && (
                      <span className="text-xs text-gray-500">{formatCurrency(transaction.amount)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-gray-600">
              {filterType === "all" ? "No transactions yet" : `No ${filterType} transactions found`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
