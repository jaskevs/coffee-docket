export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
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
  email: string
  phone?: string
  balance: number
  totalSpent: number
  lastVisit: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  type: "topup" | "served"
  amount?: number
  coffeeType?: string
  balanceAfter: number
  timestamp: string
}
