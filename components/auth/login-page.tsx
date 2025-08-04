"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Coffee, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { LoginFormData } from "@/types/auth"

interface LoginPageProps {
  onNavigateToSignUp?: () => void
  onNavigateToForgotPassword?: () => void
}

export function LoginPage({ onNavigateToSignUp, onNavigateToForgotPassword }: LoginPageProps) {
  const { login, demoLogin, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setAuthError(null)

    try {
      const success = await login(data.email, data.password)
      if (!success) {
        setAuthError("Invalid email or password. Please try again.")
      }
    } catch (error) {
      setAuthError("Login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async (role: "admin" | "customer") => {
    setAuthError(null)
    setIsSubmitting(true)

    try {
      await demoLogin(role)
    } catch (error) {
      setAuthError("Demo login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-3 rounded-lg shadow-md">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Coffee Docket</h1>
              <p className="text-sm text-gray-600">Track your perfect brew</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-gray-200 bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Sign In</CardTitle>
            <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4 animate-fade-in">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-12 text-base pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isFormLoading}
              >
                {isFormLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={onNavigateToForgotPassword}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
              >
                Forgot Password?
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={onNavigateToSignUp}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                >
                  Sign up
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Access Section */}
        {/* <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Quick Demo Access:</p>
          <div className="space-x-4">
            <Button
              variant="link"
              onClick={() => handleDemoLogin("admin")}
              disabled={isFormLoading}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Demo Admin Access
            </Button>
            <span className="text-gray-400">|</span>
            <Button
              variant="link"
              onClick={() => handleDemoLogin("customer")}
              disabled={isFormLoading}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              {isFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Demo Customer Access
            </Button>
          </div>
        </div> */}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">© 2025 CoffeeDocket. Built on caffeine.</p>
        </div>
      </div>
    </div>
  )
}
