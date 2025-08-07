"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Eye, EyeOff, Coffee, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { LoginFormData, SignupFormData } from "@/types/auth"

export function AuthForms() {
  const { login, demoLogin, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("login")

  const loginForm = useForm<LoginFormData>()
  const signupForm = useForm<SignupFormData>()

  const onLogin = async (data: LoginFormData) => {
    setAuthError(null)
    const success = await login(data.email, data.password)
    if (!success) {
      setAuthError("Invalid credentials. Try admin@coffee.com or customer@coffee.com with password 'password'")
    }
  }

  const onSignup = async (data: SignupFormData) => {
    setAuthError(null)
    // Simulate signup
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setAuthError("Signup is not implemented in this demo. Please use demo login buttons.")
  }

  const handleDemoLogin = (role: "admin" | "customer") => {
    setAuthError(null)
    demoLogin(role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-mint-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-mint-500 p-3 rounded-2xl shadow-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">CoffeeTracker</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Track your perfect brew
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4 animate-fade-in">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {/* Demo Login Buttons */}
            <div className="space-y-3 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Quick Demo Access:</p>
              </div>
              <Button
                onClick={() => handleDemoLogin("admin")}
                disabled={isLoading}
                className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coffee className="mr-2 h-4 w-4" />}
                Demo Admin Login
              </Button>
              <Button
                onClick={() => handleDemoLogin("customer")}
                disabled={isLoading}
                className="w-full h-12 bg-mint-500 hover:bg-mint-600 text-white font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coffee className="mr-2 h-4 w-4" />}
                Demo Customer Login
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-12 text-base border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                      {...loginForm.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 text-base pr-12 border-gray-200 focus:border-purple-300 focus:ring-purple-300"
                        {...loginForm.register("password", {
                          required: "Password is required",
                        })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-gray-800 hover:bg-gray-900 text-white transition-all duration-200 hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName" className="text-gray-700 font-medium">
                        First Name
                      </Label>
                      <Input
                        id="signup-firstName"
                        type="text"
                        placeholder="John"
                        className="h-12 text-base border-gray-200 focus:border-mint-300 focus:ring-mint-300"
                        {...signupForm.register("firstName", {
                          required: "First name is required",
                        })}
                      />
                      {signupForm.formState.errors.firstName && (
                        <p className="text-sm text-red-600">{signupForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastName" className="text-gray-700 font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="signup-lastName"
                        type="text"
                        placeholder="Doe"
                        className="h-12 text-base border-gray-200 focus:border-mint-300 focus:ring-mint-300"
                        {...signupForm.register("lastName", {
                          required: "Last name is required",
                        })}
                      />
                      {signupForm.formState.errors.lastName && (
                        <p className="text-sm text-red-600">{signupForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-12 text-base border-gray-200 focus:border-mint-300 focus:ring-mint-300"
                      {...signupForm.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      className="h-12 text-base border-gray-200 focus:border-mint-300 focus:ring-mint-300"
                      {...signupForm.register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="signup-confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="h-12 text-base border-gray-200 focus:border-mint-300 focus:ring-mint-300"
                      {...signupForm.register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) => {
                          const password = signupForm.watch("password")
                          return value === password || "Passwords do not match"
                        },
                      })}
                    />
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{signupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-mint-500 hover:bg-mint-600 text-white transition-all duration-200 hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">© 2025 CoffeeTracker. Made with ☕ and love.</p>
        </div>
      </div>
    </div>
  )
}
