"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@supabase/supabase-js"
import type { User, AuthState, ProfileFormData, PasswordChangeFormData } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  demoLogin: (role: "admin" | "customer") => Promise<void>
  updateProfile: (data: ProfileFormData) => Promise<boolean>
  changePassword: (data: PasswordChangeFormData) => Promise<boolean>
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo with updated structure
const mockUsers: User[] = [
  {
    id: "admin-1",
    firstName: "Sarah",
    lastName: "Admin",
    email: "admin@coffee.com",
    role: "admin",
  },
  {
    id: "customer-1",
    firstName: "John",
    lastName: "Customer",
    email: "customer@coffee.com",
    role: "customer",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })
  const [supabaseClient, setSupabaseClient] = useState<any>(null)

  // Helper function to get user profile from both tables by email
  const getUserProfile = async (client: any, email: string): Promise<User | null> => {
    try {
      // First check admin_users table
      const { data: adminData, error: adminError } = await client
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single()

      if (adminData && !adminError) {
        console.log("✅ Found admin user:", adminData)
        return {
          id: adminData.id,
          firstName: adminData.first_name,
          lastName: adminData.last_name,
          email: adminData.email,
          role: "admin",
        }
      }

      // If not admin, check customers table
      const { data: customerData, error: customerError } = await client
        .from("customers")
        .select("*")
        .eq("email", email)
        .single()

      if (customerData && !customerError) {
        console.log("✅ Found customer user:", customerData)
        return {
          id: customerData.id,
          firstName: customerData.first_name,
          lastName: customerData.last_name,
          email: customerData.email,
          role: "customer",
        }
      }

      console.log("❌ User not found in either table")
      return null
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  // Helper function to get user profile by Supabase user ID for email-optional customers
  const getUserProfileById = async (client: any, supabaseUserId: string): Promise<User | null> => {
    try {
      // First check admin_users table by supabase_user_id
      const { data: adminData, error: adminError } = await client
        .from("admin_users")
        .select("*")
        .eq("supabase_user_id", supabaseUserId)
        .single()

      if (adminData && !adminError) {
        console.log("✅ Found admin user by supabase ID:", adminData)
        return {
          id: adminData.id,
          firstName: adminData.first_name,
          lastName: adminData.last_name,
          email: adminData.email,
          role: "admin",
        }
      }

      // If not admin, check customers table by supabase_user_id
      const { data: customerData, error: customerError } = await client
        .from("customers")
        .select("*")
        .eq("supabase_user_id", supabaseUserId)
        .single()

      if (customerData && !customerError) {
        console.log("✅ Found customer user by supabase ID:", customerData)
        return {
          id: customerData.id,
          firstName: customerData.first_name,
          lastName: customerData.last_name,
          email: customerData.email,
          role: "customer",
        }
      }

      console.log("❌ User not found by supabase ID in either table")
      return null
    } catch (error) {
      console.error("Error getting user profile by ID:", error)
      return null
    }
  }

  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        console.log("Supabase URL:", supabaseUrl)
        console.log("Checking Supabase config:", {
          url: supabaseUrl ? "✓ Set" : "✗ Missing",
          key: supabaseKey ? "✓ Set" : "✗ Missing",
        })

        if (!supabaseUrl || !supabaseKey) {
          console.log("Supabase not configured, using demo mode")
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return
        }

        try {
          // Create Supabase client directly using npm package
          const client = createClient(supabaseUrl, supabaseKey)
          setSupabaseClient(client)
          console.log("✅ Supabase client initialized successfully")

          // Test connection
          const { data, error } = await client.auth.getSession()
          if (error) {
            console.error("Supabase connection error:", error)
            console.log("Falling back to demo mode")
            setAuthState((prev) => ({ ...prev, isLoading: false }))
            return
          } else {
            console.log("✅ Supabase connection verified")

            if (data.session?.user) {
              // Get user profile from both admin_users and customers tables
              // Handle email-optional customers (admin-created without email)
              const userEmail = data.session.user.email
              const supabaseUserId = data.session.user.id
              
              let userProfile = null
              
              if (userEmail) {
                // Try lookup by email first
                userProfile = await getUserProfile(client, userEmail)
              }
              
              if (!userProfile && supabaseUserId) {
                // If no profile found by email, try lookup by Supabase user ID
                userProfile = await getUserProfileById(client, supabaseUserId)
              }

              if (userProfile) {
                setAuthState({
                  user: userProfile,
                  isAuthenticated: true,
                  isLoading: false,
                })
                console.log(`✅ User logged in as ${userProfile.role}:`, userProfile)
                return
              } else {
                console.log("❌ User profile not found in database")
              }
            }
          }

          // Listen for auth changes
          client.auth.onAuthStateChange(async (event: string, session: any) => {
            console.log("Auth state changed:", event)

            if (event === "SIGNED_IN" && session?.user) {
              // Get user profile from both tables
              // Handle email-optional customers safely
              const userEmail = session.user.email
              const supabaseUserId = session.user.id
              
              let userProfile = null
              
              if (userEmail) {
                // Try lookup by email first
                userProfile = await getUserProfile(client, userEmail)
              }
              
              if (!userProfile && supabaseUserId) {
                // If no profile found by email, try lookup by Supabase user ID
                userProfile = await getUserProfileById(client, supabaseUserId)
              }

              if (userProfile) {
                setAuthState({
                  user: userProfile,
                  isAuthenticated: true,
                  isLoading: false,
                })
                console.log(`✅ User signed in as ${userProfile.role}:`, userProfile)
              } else {
                console.log("❌ User profile not found in database")
                setAuthState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                })
              }
            } else if (event === "SIGNED_OUT") {
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              })
              localStorage.removeItem("coffee-user")
            }
          })
        } catch (supabaseError) {
          console.error("Supabase initialization failed:", supabaseError)
          console.log("Falling back to demo mode")
        }
      } catch (error) {
        console.error("Supabase initialization error:", error)
      }

      // Check for stored user (demo mode fallback)
      const storedUser = localStorage.getItem("coffee-user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          localStorage.removeItem("coffee-user")
          setAuthState((prev) => ({ ...prev, isLoading: false }))
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    initSupabase()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (supabaseClient) {
        console.log("Attempting Supabase login for:", email)

        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        })

        if (data.user && !error) {
          console.log("✅ Supabase authentication successful")

          // Get user profile from both tables
          const userProfile = await getUserProfile(supabaseClient, email)

          if (userProfile) {
            setAuthState({
              user: userProfile,
              isAuthenticated: true,
              isLoading: false,
            })
            console.log(`✅ Login successful as ${userProfile.role}:`, userProfile)
            return true
          } else {
            console.log("❌ User profile not found in database")
            setAuthState((prev) => ({ ...prev, isLoading: false }))
            return false
          }
        } else if (error) {
          console.error("Supabase login error:", error.message)
        }
      }

      // Fallback to mock authentication for demo
      console.log("Trying demo login for:", email)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check both admin and customer mock users
      const user = mockUsers.find((u) => u.email === email)

      if (user && password === "password") {
        console.log(`✅ Demo login successful as ${user.role}`)
        localStorage.setItem("coffee-user", JSON.stringify(user))
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }

      console.log("❌ Demo login failed - invalid credentials")
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    } catch (error) {
      console.error("Login error:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const demoLogin = async (role: "admin" | "customer"): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const user = mockUsers.find((u) => u.role === role)
      if (user) {
        localStorage.setItem("coffee-user", JSON.stringify(user))
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        console.log(`✅ Demo login as ${role}:`, user)
      }
    } catch (error) {
      console.error("Demo login error:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (supabaseClient) {
        console.log("Attempting Supabase signup for:", email)

        // First create auth user
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
          email,
          password,
        })

        if (authError) {
          console.error("Supabase auth signup error:", authError.message)
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return false
        }

        // Then create customer record (new signups are always customers)
        if (authData.user) {
          const { error: profileError } = await supabaseClient.from("customers").insert([
            {
              first_name: firstName,
              last_name: lastName,
              email: email,
              coffee_balance: 0,
              total_spent: 0,
              visit_count: 0,
              last_visit: null,
            },
          ])

          if (profileError) {
            console.error("Profile creation error:", profileError)
            // Continue anyway, profile can be created later
          } else {
            console.log("✅ Customer profile created")
          }
        }

        console.log("✅ Supabase signup successful")
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return true
      }

      // Demo mode - just return false to show message
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    } catch (error) {
      console.error("Signup error:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (supabaseClient) {
        console.log("Attempting password reset for:", email)

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        })

        if (error) {
          console.error("Password reset error:", error.message)
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return false
        }

        console.log("✅ Password reset email sent")
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return true
      }

      // Demo mode - just return true
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      console.error("Password reset error:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const updateProfile = async (data: ProfileFormData): Promise<boolean> => {
    if (!authState.user) return false

    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (supabaseClient) {
        // Update the appropriate table based on user role
        const tableName = authState.user.role === "admin" ? "admin_users" : "customers"

        // Update database table first
        const { error: dbError } = await supabaseClient
          .from(tableName)
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
          })
          .eq("id", authState.user.id)

        if (dbError) {
          console.error("Database update error:", dbError)
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return false
        }

        // If email changed, also update Supabase Auth user email
        if (data.email !== authState.user.email) {
          try {
            // Get the admin client to update the auth user
            const { getSupabaseAdminClient } = await import('../lib/supabase')
            const adminClient = await getSupabaseAdminClient()
            
            if (adminClient) {
              // First, find the auth user by the current email
              const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()
              
              if (!listError && authUsers) {
                const authUser = authUsers.users.find((user: any) => user.email === authState.user?.email)
                
                if (authUser) {
                  // Update the auth user's email
                  const { error: authError } = await adminClient.auth.admin.updateUserById(
                    authUser.id,
                    { email: data.email }
                  )
                  
                  if (authError) {
                    console.error("Auth email update error:", authError)
                    // Continue anyway, as the database was updated successfully
                  } else {
                    console.log("✅ Auth user email updated successfully")
                  }
                } else {
                  console.log("Auth user not found for email update")
                }
              } else {
                console.error("Error listing auth users:", listError)
              }
            } else {
              console.error("Admin client not available for auth email update")
            }
          } catch (authUpdateError) {
            console.error("Error during auth email update:", authUpdateError)
            // Continue anyway, as the database was updated successfully
          }
        }

        const updatedUser = {
          ...authState.user,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        }

        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }))
        return true
      }

      // Fallback to localStorage update
      const updatedUser = {
        ...authState.user,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      }

      localStorage.setItem("coffee-user", JSON.stringify(updatedUser))
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }))
      return true
    } catch (error) {
      console.error("Profile update error:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const changePassword = async (data: PasswordChangeFormData): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient.auth.updateUser({
          password: data.newPassword,
        })

        if (!error) {
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return true
        }
      }

      // For demo mode, just return success
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      console.error("Password change error:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (supabaseClient) {
        await supabaseClient.auth.signOut()
      }

      localStorage.removeItem("coffee-user")
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      console.error("Logout error:", error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        demoLogin,
        updateProfile,
        changePassword,
        signup,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
