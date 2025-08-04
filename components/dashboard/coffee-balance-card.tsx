"use client"

import { Coffee, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CoffeeBalance } from "@/types/dashboard"

interface CoffeeBalanceCardProps {
  balance: CoffeeBalance
  isLoading?: boolean
}

export function CoffeeBalanceCard({ balance, isLoading = false }: CoffeeBalanceCardProps) {
  const getBalanceStatus = (remaining: number) => {
    if (remaining <= 2) return { status: "low", color: "bg-red-100 text-red-800", icon: TrendingDown }
    if (remaining <= 5) return { status: "medium", color: "bg-orange-100 text-orange-800", icon: TrendingUp }
    return { status: "good", color: "bg-green-100 text-green-800", icon: TrendingUp }
  }

  const balanceStatus = getBalanceStatus(balance.remaining)
  const StatusIcon = balanceStatus.icon

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-coffee-500 to-coffee-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="animate-pulse bg-white/20 h-6 w-32 rounded"></div>
            <div className="animate-pulse bg-white/20 h-8 w-8 rounded-full"></div>
          </div>
          <div className="text-center">
            <div className="animate-pulse bg-white/20 h-16 w-24 mx-auto rounded mb-2"></div>
            <div className="animate-pulse bg-white/20 h-4 w-40 mx-auto rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-coffee-500 to-coffee-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${balanceStatus.color} border-0`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {balance.remaining <= 2 ? "Low Balance" : balance.remaining <= 5 ? "Medium" : "Good"}
          </Badge>
          <div className="bg-white/20 p-2 rounded-full">
            <Coffee className="w-6 h-6" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-5xl font-bold mb-2 tabular-nums">{balance.remaining}</div>
          <p className="text-cream-200 text-lg font-medium">Coffee{balance.remaining !== 1 ? "s" : ""} Remaining</p>
          <p className="text-cream-300 text-sm mt-2">
            Last updated:{" "}
            {balance.lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {balance.remaining <= 2 && (
          <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-400/30">
            <p className="text-sm text-center text-red-100">⚠️ Low balance! Consider topping up soon.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
