"use client"

import { useState } from "react"
import { LoginPage } from "@/components/auth/login-page"
import { SignUpPage } from "@/components/auth/sign-up-page"
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page"
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { AdminTransactionHistory } from "@/components/admin/admin-transaction-history"
import { AddCustomerForm } from "@/components/admin/add-customer-form"
import { MenuManagement } from "@/components/menu/menu-management"
import { ProfilePage } from "@/components/profile/profile-page"
import { Navigation } from "./navigation"
import { useAuth } from "@/contexts/auth-context"

export function AppRouter() {
  const { user, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState("login")

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleLogout = () => {
    logout()
    setCurrentPage("login")
  }

  // Authentication pages
  if (!user) {
    switch (currentPage) {
      case "signup":
        return <SignUpPage onBack={() => handleNavigate("login")} />
      case "forgot-password":
        return <ForgotPasswordPage onBack={() => handleNavigate("login")} />
      default:
        return (
          <LoginPage
            onNavigateToSignUp={() => handleNavigate("signup")}
            onNavigateToForgotPassword={() => handleNavigate("forgot-password")}
          />
        )
    }
  }

  // Authenticated pages
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onNavigate={handleNavigate} />

      <main>
        {(() => {
          switch (currentPage) {
            case "customer-dashboard":
              return user.role === "customer" ? (
                <CustomerDashboard userId={user.id} userEmail={user.email} />
              ) : (
                <AdminDashboard onNavigate={handleNavigate} />
              )

            case "admin-dashboard":
              return user.role === "admin" ? (
                <AdminDashboard onNavigate={handleNavigate} />
              ) : (
                <CustomerDashboard userId={user.id} userEmail={user.email} />
              )

            case "admin-transactions":
              return user.role === "admin" ? (
                <AdminTransactionHistory onBack={() => handleNavigate("admin-dashboard")} />
              ) : (
                <div className="p-6 text-center">
                  <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
                  <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
                </div>
              )

            case "add-customer":
              return user.role === "admin" ? (
                <AddCustomerForm onNavigate={handleNavigate} />
              ) : (
                <div className="p-6 text-center">
                  <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
                  <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
                </div>
              )

            case "menu-management":
              return user.role === "admin" ? (
                <MenuManagement onNavigate={handleNavigate} />
              ) : (
                <div className="p-6 text-center">
                  <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
                  <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
                </div>
              )

            case "profile":
              return <ProfilePage onNavigate={handleNavigate} />

            default:
              return user.role === "admin" ? (
                <AdminDashboard onNavigate={handleNavigate} />
              ) : (
                <CustomerDashboard userId={user.id} userEmail={user.email} />
              )
          }
        })()}
      </main>
    </div>
  )
}
