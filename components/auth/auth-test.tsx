"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginPage } from "./login-page"
import { SignUpPage } from "./sign-up-page"
import { ForgotPasswordPage } from "./forgot-password-page"

type AuthPage = "login" | "signup" | "forgot-password"

export function AuthTest() {
  const [currentPage, setCurrentPage] = useState<AuthPage>("login")

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onNavigateToSignUp={() => setCurrentPage("signup")}
            onNavigateToForgotPassword={() => setCurrentPage("forgot-password")}
          />
        )
      case "signup":
        return <SignUpPage onBackToLogin={() => setCurrentPage("login")} />
      case "forgot-password":
        return <ForgotPasswordPage onBackToLogin={() => setCurrentPage("login")} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Debug Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-48">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Auth Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={currentPage === "login" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage("login")}
              className="w-full"
            >
              Login
            </Button>
            <Button
              variant={currentPage === "signup" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage("signup")}
              className="w-full"
            >
              Sign Up
            </Button>
            <Button
              variant={currentPage === "forgot-password" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage("forgot-password")}
              className="w-full"
            >
              Forgot Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {renderPage()}
    </div>
  )
}
