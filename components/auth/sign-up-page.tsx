"use client"

import type React from "react"

import { useState } from "react"
import { Coffee, ArrowLeft, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

interface SignUpPageProps {
  onBack: () => void
}

export function SignUpPage({ onBack }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== CUSTOMER SIGNUP STARTED ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Form data:", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      passwordLength: formData.password?.length
    })
    
    setError("")
    setIsLoading(true)

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // First check if email already exists in customers table
      console.log("Step 1: Checking if email already exists...")
      const { data: existingCustomer, error: checkEmailError } = await supabase
        .from('customers')
        .select('email')
        .eq('email', formData.email)
        .single()

      if (existingCustomer) {
        console.log("Email already exists in customers table:", formData.email)
        throw new Error("An account with this email already exists. Please sign in instead.")
      }

      console.log("Step 2: Email not found in customers, proceeding with account creation...")
      
      // Create user account with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'customer'
          }
        }
      })

      if (signUpError) {
        console.error("Signup error:", signUpError)
        
        // Check if user already exists
        if (signUpError.message?.includes('User already registered') || 
            signUpError.status === 400 || 
            signUpError.message?.includes('already been registered')) {
          console.log("User already exists - not creating customer profile")
          throw new Error("An account with this email already exists. Please sign in instead.")
        }
        throw signUpError
      }

      // Only proceed if we have a new user
      if (!authData.user) {
        console.log("No user returned from signup - may already exist")
        throw new Error("Unable to create account. This email may already be registered.")
      }

      console.log("Step 3: Auth account created", {
        userId: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user?.email_confirmed_at
      })

      // Check if customer profile already exists before creating
      console.log("Step 4: Checking if customer profile already exists...")
      const { data: existingProfile, error: checkError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (existingProfile) {
        console.log("Customer profile already exists, skipping creation")
      } else {
        console.log("Step 5: Creating new customer profile in database...")
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email
            // balance, total_spent, visit_count will use database defaults
            // created_at and updated_at will use database defaults
          })
          .select()
          .single()

        if (customerError) {
          console.error("Customer profile creation error:", customerError)
          console.error("Error details:", {
            code: customerError.code,
            message: customerError.message,
            details: customerError.details
          })
          
          // Check if it's a duplicate key error
          if (customerError.code === '23505' || customerError.message?.includes('duplicate')) {
            console.log("Customer profile already exists (duplicate key)")
          } else {
            console.warn("User created but customer profile failed. User may need to complete profile later.")
          }
        } else {
          console.log("Customer profile created successfully:", customerData)
        }
      }

      // Check if email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at) {
        console.log("Step 6: Email confirmation required")
        console.log("Confirmation email sent to:", formData.email)
        setEmailConfirmationSent(true)
      }

      console.log("Step 7: Signup process completed")
      console.log("=== CUSTOMER SIGNUP COMPLETED ===")
      setSuccess(true)
      
    } catch (err: any) {
      console.error("=== SIGNUP ERROR ===")
      console.error("Error details:", err)
      
      // Handle specific Supabase errors
      if (err.message?.includes('User already registered')) {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (err.message?.includes('Invalid email')) {
        setError("Please enter a valid email address.")
      } else if (err.message?.includes('Password')) {
        setError("Password must be at least 6 characters long.")
      } else if (err.message?.includes('rate limit')) {
        setError("Too many signup attempts. Please try again later.")
      } else {
        setError(err.message || "Failed to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full shadow-lg mb-4">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Account Created!</h1>
            <p className="text-gray-600 mt-2">Welcome to CoffeeDocket</p>
          </div>

          <Card className="shadow-lg border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  {emailConfirmationSent ? (
                    <Mail className="w-8 h-8 text-green-500" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {emailConfirmationSent ? "Check Your Email!" : "Successfully Registered!"}
                </h2>
                {emailConfirmationSent ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      We've sent a confirmation email to <strong>{formData.email}</strong>
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                      <p className="text-sm text-blue-900 font-medium mb-2">Next steps:</p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Check your email inbox</li>
                        <li>Click the confirmation link</li>
                        <li>Return here to sign in</li>
                      </ol>
                    </div>
                    <p className="text-sm text-gray-500">
                      Didn't receive the email? Check your spam folder.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-6">
                    Your account has been created. You can now sign in with your credentials.
                  </p>
                )}
                <Button 
                  onClick={onBack} 
                  className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-base font-medium mt-6"
                >
                  Continue to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded shadow-lg mb-4">
            <Coffee className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join CoffeeDocket today</p>
        </div>

        <Card className="shadow-lg border-gray-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl font-semibold text-gray-900">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="John"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={onBack}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-900 h-12 text-base"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
