export interface CoffeeBalance {
  remaining: number
  lastUpdated: Date
}

export interface Transaction {
  id: string
  type: "served" | "topup"
  coffeeCount: number
  amount?: number
  timestamp: Date
  description: string
}

export interface UserSettings {
  lowBalanceNotifications: boolean
  topupNotifications: boolean
  lowBalanceThreshold: number
}

export interface User {
  id: string
  name: string
  email: string
  coffeeBalance: CoffeeBalance
  settings: UserSettings
}

export interface DashboardData {
  user: User
  recentTransactions: Transaction[]
  isLoading: boolean
}
