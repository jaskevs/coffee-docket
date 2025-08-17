"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { supabaseService } from "@/lib/supabase-service"
import type { TransactionWithAddonNames } from "@/lib/supabase-service"

interface AdminTransactionHistoryProps {
  onBack: () => void
}

export function AdminTransactionHistory({ onBack }: AdminTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionWithAddonNames[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await supabaseService.getTransactionsWithAddonNames()
      setTransactions(data)
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack} className="flex items-center space-x-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">All Transactions</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <TransactionsTable transactions={transactions} showCustomerColumn={true} />
        )}
      </div>
    </div>
  )
}
