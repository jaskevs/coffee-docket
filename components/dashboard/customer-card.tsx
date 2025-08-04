"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Mail, Clock } from "lucide-react"
import type { Customer } from "@/lib/supabase-service"

interface CustomerCardProps {
  customer: Customer
  onClick: () => void
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const getBalanceColor = (balance: number) => {
    if (balance === 0) return "text-red-600 bg-red-50"
    if (balance <= 2) return "text-amber-600 bg-amber-50"
    return "text-green-600 bg-green-50"
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-gray-200 hover:border-gray-300"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {customer.firstName} {customer.lastName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className={getStatusColor(customer.status)}>
                {customer.status}
              </Badge>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getBalanceColor(customer.balance)}`}>
            <Coffee className="inline w-4 h-4 mr-1" />
            {customer.balance.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{customer.email}</span>
          </div>

          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>Last seen {formatLastActivity(customer.lastVisit)}</span>
          </div>

          {customer.visitCount && (
            <div className="text-xs text-gray-500">
              {customer.visitCount} visits • ${(customer.totalSpent || 0).toFixed(2)} spent
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
