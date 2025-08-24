"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [message, setMessage] = useState("Processing authentication...")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Extract tokens
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        const type = hashParams.get("type")
        
        if (!accessToken) {
          throw new Error("No authentication tokens received")
        }

        // For password reset flow
        if (type === "recovery") {
          setMessage("Password reset verified. Redirecting to reset page...")
          // Store tokens temporarily for the reset form
          sessionStorage.setItem("supabase.auth.token", JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            type: "recovery"
          }))
          
          setTimeout(() => {
            router.push("/reset-password")
          }, 1500)
          return
        }

        // For email confirmation flow
        if (type === "signup" || type === "magiclink") {
          setMessage("Email verified successfully! Redirecting to login...")
          setStatus("success")
          
          // Clear any temporary tokens
          sessionStorage.removeItem("supabase.auth.token")
          
          setTimeout(() => {
            router.push("/login?verified=true")
          }, 2000)
          return
        }

        // For regular login (shouldn't happen with current flow but handle it)
        setMessage("Authentication successful! Redirecting...")
        setStatus("success")
        
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
        
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Authentication failed")
        
        // Redirect to login after showing error
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    // Only run on client side when hash is available
    if (typeof window !== "undefined" && window.location.hash) {
      handleAuthCallback()
    } else {
      // No hash fragment, probably a direct navigation
      setStatus("error")
      setMessage("No authentication data received")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === "processing" && "Processing Authentication"}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Error"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {status === "processing" && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            
            <Alert className={
              status === "error" ? "border-red-500" : 
              status === "success" ? "border-green-500" : 
              "border-blue-500"
            }>
              <AlertDescription className="text-center">
                {message}
              </AlertDescription>
            </Alert>

            {status === "error" && (
              <p className="text-sm text-gray-500 text-center">
                You will be redirected to the login page shortly.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}