export interface User {
  id: string
  firstName: string
  lastName: string
  email: string | null
  role: "admin" | "customer"
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
}

export interface PasswordChangeFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  demoLogin: (role: "admin" | "customer") => Promise<void>
  updateProfile: (data: ProfileFormData) => Promise<boolean>
  changePassword: (data: PasswordChangeFormData) => Promise<boolean>
  signup: (data: SignupFormData) => Promise<boolean>
  resetPassword: (data: ResetPasswordFormData) => Promise<boolean>
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  balance: number
  totalSpent: number
  visitCount: number
  lastVisit?: string
  status: "active" | "inactive"
  notificationLowBalance: boolean
  notificationTopup: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  customerId?: string
  adminId?: string
  type: "topup" | "serve" | "refund"
  coffeeCount: number
  amount?: number
  drinkName?: string
  sizeName?: string
  addons?: string[]
  discountAmount?: number
  notes?: string
  description?: string
  createdAt: string
}

export type AuthMode = "login" | "signup" | "forgot-password" | "reset-password"

export type SignUpFormData = SignupFormData

export interface CoffeeSize {
  id: string
  name: string
  price: number
  multiplier: number
}
