"use client"

import { useState } from "react"
import { Coffee, Filter, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/supabase-service"

interface TransactionsTableProps {
  transactions: Transaction[]
  customerName: string
}

export function TransactionsTable({ transactions, customerName }: TransactionsTableProps) {
  const [filterType, setFilterType] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filterType === "all") return true
      return transaction.type === filterType
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <DollarSign className="w-4 h-4" />
      case "serve":
        return <Coffee className="w-4 h-4" />
      case "refund":
        return <Coffee className="w-4 h-4" />
      default:
        return <Coffee className="w-4 h-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "topup":
        return "bg-green-100 text-green-600 border-green-200"
      case "serve":
        return "bg-red-100 text-red-600 border-red-200"
      case "refund":
        return "bg-blue-100 text-blue-600 border-blue-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  // Calculate summary statistics
  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "topup") {
        acc.coffeesAdded += transaction.coffeeCount
        acc.totalTopup += transaction.amount || 0
      } else if (transaction.type === "serve") {
        acc.coffeesServed += transaction.coffeeCount
        acc.totalSpent += transaction.amount || 0
      } else if (transaction.type === "refund") {
        acc.coffeesRefunded += transaction.coffeeCount
        acc.totalRefunded += transaction.amount || 0
      }
      return acc
    },
    {
      coffeesAdded: 0,
      coffeesServed: 0,
      coffeesRefunded: 0,
      totalTopup: 0,
      totalSpent: 0,
      totalRefunded: 0,
    },
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coffees Added</p>
                <p className="text-2xl font-bold text-green-600">{summary.coffeesAdded}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(summary.totalTopup)} spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coffees Served</p>
                <p className="text-2xl font-bold text-red-600">{summary.coffeesServed}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-lg">
                <Coffee className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(summary.totalSpent)} value</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.coffeesAdded - summary.coffeesServed + summary.coffeesRefunded}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Coffee className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Current balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Transaction History for {customerName}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="topup">Top-ups</SelectItem>
                  <SelectItem value="serve">Served</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                <Filter className="w-4 h-4 mr-1" />
                {sortOrder === "desc" ? "Newest" : "Oldest"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border ${getTransactionColor(transaction.type)}`}
                      >
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <Badge variant="outline" className={`text-xs ${getTransactionColor(transaction.type)}`}>
                            {transaction.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <span>{formatDate(transaction.createdAt)}</span>
                          {transaction.drinkName && (
                            <>
                              <span>•</span>
                              <span>{transaction.drinkName}</span>
                            </>
                          )}
                          {transaction.sizeName && (
                            <>
                              <span>•</span>
                              <span>{transaction.sizeName}</span>
                            </>
                          )}
                          {transaction.addons && transaction.addons.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{transaction.addons.join(", ")}</span>
                            </>
                          )}
                        </div>
                        {transaction.notes && <p className="text-sm text-gray-600 mt-1 italic">{transaction.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end space-y-1">
                        <Badge
                          variant={transaction.type === "serve" ? "destructive" : "default"}
                          className="text-sm font-medium"
                        >
                          {transaction.type === "serve" ? "-" : "+"}
                          {transaction.coffeeCount} coffee{transaction.coffeeCount !== 1 ? "s" : ""}
                        </Badge>
                        {transaction.amount && (
                          <span className="text-sm text-gray-600">{formatCurrency(transaction.amount)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filterType === "all" ? "No transactions found" : `No ${filterType} transactions found`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
