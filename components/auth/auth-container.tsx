"use client"

import { useState } from "react"
import { Coffee } from "lucide-react"
import type { AuthMode } from "@/types/auth"
import { LoginForm } from "./login-form"
import { SignUpForm } from "./signup-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { ResetPasswordForm } from "./reset-password-form"

interface AuthContainerProps {
  initialMode?: AuthMode
  onModeChange?: (mode: AuthMode) => void
}

export function AuthContainer({ initialMode = "login", onModeChange }: AuthContainerProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode)

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode)
    onModeChange?.(mode)
  }

  const renderForm = () => {
    switch (authMode) {
      case "login":
        return (
          <LoginForm
            onForgotPassword={() => handleModeChange("forgot-password")}
            onSignUp={() => handleModeChange("signup")}
          />
        )
      case "signup":
        return <SignUpForm onBackToLogin={() => handleModeChange("login")} />
      case "forgot-password":
        return <ForgotPasswordForm onBackToLogin={() => handleModeChange("login")} />
      case "reset-password":
        return <ResetPasswordForm onBackToLogin={() => handleModeChange("login")} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-900 p-3 rounded-full">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CoffeeTracker</h1>
              <p className="text-sm text-gray-600">Track your perfect brew</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">{renderForm()}</div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">© 2025 CoffeeTracker. Made with ☕ and love.</p>
      </div>
    </div>
  )
}
