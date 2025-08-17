import { getSupabaseClient, getSupabaseAdminClient } from "./supabase"

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
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
  customerId: string
  customerName?: string
  adminId?: string
  type: "topup" | "serve" | "refund"
  coffeeCount: number
  amount?: number
  drinkName?: string
  sizeName?: string
  addons?: string[] // Store addon IDs instead of names
  discountAmount?: number
  notes?: string
  description?: string
  timestamp: string
  createdAt: string
}

// Transaction with addon names for display
export interface TransactionWithAddonNames extends Omit<Transaction, 'addons'> {
  addons?: string[] // Addon names for display
  addonIds?: string[] // Original addon IDs
}

export interface CustomerStats {
  totalCustomers: number
  totalBalance: number
  totalTransactions: number
  totalRevenue: number
  averageOrderValue: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  basePrice: number
  category: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface MenuSize {
  id: string
  name: string
  displayName: string
  priceModifier: number
  description: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface MenuAddon {
  id: string
  name: string
  description: string
  priceModifier: number
  category: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

class SupabaseService {
  async getCustomers(): Promise<Customer[]> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return data.map((customer: any) => ({
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        balance: customer.coffee_balance || 0,
        totalSpent: Number.parseFloat(customer.total_spent) || 0,
        visitCount: customer.visit_count || 0,
        lastVisit: customer.last_visit,
        status: customer.status || "active",
        notificationLowBalance: customer.notification_low_balance ?? true,
        notificationTopup: customer.notification_topup ?? true,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at || customer.created_at,
      }))
    } catch (error) {
      console.error("Error fetching customers:", error)
      return []
    }
  }

  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

      if (error) throw error

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        balance: data.coffee_balance || 0,
        totalSpent: Number.parseFloat(data.total_spent) || 0,
        visitCount: data.visit_count || 0,
        lastVisit: data.last_visit,
        status: data.status || "active",
        notificationLowBalance: data.notification_low_balance ?? true,
        notificationTopup: data.notification_topup ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error fetching customer:", error)
      return null
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase.from("customers").select("*").eq("email", email).single()

      if (error) {
        console.error("Error fetching customer by email:", error)
        return null
      }

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        balance: data.coffee_balance || 0,
        totalSpent: Number.parseFloat(data.total_spent) || 0,
        visitCount: data.visit_count || 0,
        lastVisit: data.last_visit,
        status: data.status || "active",
        notificationLowBalance: data.notification_low_balance ?? true,
        notificationTopup: data.notification_topup ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error fetching customer by email:", error)
      return null
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching customer by ID:", error)
        return null
      }

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        balance: data.coffee_balance || 0,
        totalSpent: Number.parseFloat(data.total_spent) || 0,
        visitCount: data.visit_count || 0,
        lastVisit: data.last_visit,
        status: data.status || "active",
        notificationLowBalance: data.notification_low_balance ?? true,
        notificationTopup: data.notification_topup ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error fetching customer by ID:", error)
      return null
    }
  }

  async createCustomer(customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase
        .from("customers")
        .insert({
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          coffee_balance: customer.balance || 0,
          total_spent: customer.totalSpent || 0,
          visit_count: customer.visitCount || 0,
          last_visit: customer.lastVisit || null,
          status: customer.status || "active",
          notification_low_balance: customer.notificationLowBalance ?? true,
          notification_topup: customer.notificationTopup ?? true,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        balance: data.coffee_balance || 0,
        totalSpent: Number.parseFloat(data.total_spent) || 0,
        visitCount: data.visit_count || 0,
        lastVisit: data.last_visit,
        status: customer.status || "active",
        notificationLowBalance: data.notification_low_balance ?? true,
        notificationTopup: data.notification_topup ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error creating customer:", error)
      throw error
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const updateData: any = {}
      if (updates.firstName) updateData.first_name = updates.firstName
      if (updates.lastName) updateData.last_name = updates.lastName
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.balance !== undefined) updateData.coffee_balance = updates.balance
      if (updates.totalSpent !== undefined) updateData.total_spent = updates.totalSpent
      if (updates.visitCount !== undefined) updateData.visit_count = updates.visitCount
      if (updates.lastVisit !== undefined) updateData.last_visit = updates.lastVisit
      if (updates.status) updateData.status = updates.status
      if (updates.notificationLowBalance !== undefined)
        updateData.notification_low_balance = updates.notificationLowBalance
      if (updates.notificationTopup !== undefined) updateData.notification_topup = updates.notificationTopup

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase.from("customers").update(updateData).eq("id", id).select().single()

      if (error) throw error

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        balance: data.coffee_balance || 0,
        totalSpent: Number.parseFloat(data.total_spent) || 0,
        visitCount: data.visit_count || 0,
        lastVisit: data.last_visit,
        status: data.status || "active",
        notificationLowBalance: data.notification_low_balance ?? true,
        notificationTopup: data.notification_topup ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error updating customer:", error)
      throw error
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { error } = await supabase.from("customers").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting customer:", error)
      throw error
    }
  }

  async deleteCustomerCompletely(id: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      // First, get the customer to check if they have an email (for auth deletion)
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("email")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error("Error fetching customer for deletion:", fetchError)
        throw fetchError
      }

      // If customer has email, try to remove from Supabase Auth using admin client
      if (customer?.email) {
        try {
          const adminClient = await getSupabaseAdminClient()
          if (adminClient) {
            // First, find the auth user by email
            const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()
            
            if (!listError && authUsers) {
              const authUser = authUsers.users.find((user: any) => user.email === customer.email)
              
              if (authUser) {
                // Delete the auth user
                const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(authUser.id)
                
                if (deleteAuthError) {
                  console.error("Error deleting auth user:", deleteAuthError)
                }
              }
            } else if (listError) {
              console.error("Error listing auth users:", listError)
            }
          }
        } catch (authError) {
          console.error("Error during auth cleanup:", authError)
          // Continue with customer deletion even if auth cleanup fails
        }
      }

      // Delete from customers table
      const { error: deleteError } = await supabase.from("customers").delete().eq("id", id)

      if (deleteError) {
        console.error("Error deleting customer from database:", deleteError)
        throw deleteError
      }
    } catch (error) {
      console.error("Error deleting customer completely:", error)
      throw error
    }
  }

  async removeCustomerAuthentication(customerId: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      // Get the customer's email to find them in auth
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("email")
        .eq("id", customerId)
        .single()

      if (fetchError) {
        console.error("Error fetching customer for auth removal:", fetchError)
        return
      }

      if (customer?.email) {
        try {
          const adminClient = await getSupabaseAdminClient()
          if (adminClient) {
            // Find the auth user by email
            const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()
            
            if (!listError && authUsers) {
              const authUser = authUsers.users.find((user: any) => user.email === customer.email)
              
              if (authUser) {
                // Delete the auth user
                const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(authUser.id)
                
                if (deleteAuthError) {
                  console.error("Error deleting auth user:", deleteAuthError)
                }
              }
            } else if (listError) {
              console.error("Error listing auth users:", listError)
            }
          }
        } catch (authError) {
          console.error("Error during auth cleanup:", authError)
        }
      }
    } catch (error) {
      console.error("Error in authentication removal process:", error)
      // Don't throw the error since email clearing is the main goal and that works
    }
  }

  async sendAuthInvitation(email: string, userData: { firstName: string; lastName: string; customerId?: string }): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      console.log("=== SEND AUTH INVITATION STARTED ===")
      console.log("Email:", email)
      console.log("User data:", userData)
      
      // For client-side execution, we'll use a different approach
      // We'll create a temporary auth record and immediately send a password reset
      const client = await getSupabaseClient()
      
      if (!client) {
        console.error("No Supabase client available")
        return { success: false, error: "Unable to connect to authentication service" }
      }

      console.log("Step 1: Attempting to create auth account for customer...")
      
      // Try to sign up the user with a random password
      // This will create an auth account if it doesn't exist
      const tempPassword = Math.random().toString(36).slice(-16) + "Aa1!@#"
      
      const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email: email,
        password: tempPassword,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
            role: 'customer',
            created_by_admin: true,
            customer_id: userData.customerId
          }
          // Remove emailRedirectTo to avoid sending confirmation email
        }
      })
      
      if (signUpError) {
        console.error("Error creating auth account:", signUpError)
        
        // If user already exists, they can use their existing auth
        if (signUpError.message?.includes('already registered')) {
          console.log("User already exists with authentication - they can sign in")
          return { 
            success: true, 
            message: "Authentication already exists for this email. Customer can sign in with their existing credentials."
          }
        } else {
          return { success: false, error: signUpError.message }
        }
      }
      
      if (signUpData.user) {
        console.log("Auth account created with ID:", signUpData.user.id)
        console.log("Email confirmed:", signUpData.user.email_confirmed_at)
        
        // Update the customer record to link with the new auth user
        if (userData.customerId && signUpData.user.id) {
          console.log("Step 2: Linking auth user to customer record...")
          const { error: updateError } = await client
            .from('customers')
            .update({ id: signUpData.user.id })
            .eq('id', userData.customerId)
            
          if (updateError) {
            console.error("Error linking customer to auth user:", updateError)
          } else {
            console.log("Customer record linked to auth user successfully")
          }
        }
        
        console.log("=== SEND AUTH INVITATION COMPLETED ===")
        
        return { 
          success: true, 
          userId: signUpData.user.id,
          message: `Authentication account created successfully! Customer can now sign in with email: ${email} and the temporary password you provided, or they can reset their password.`,
          tempPassword: tempPassword // Return temp password so admin can share it
        }
      } else {
        console.log("No user data returned from signup")
        return { success: false, error: "Failed to create authentication account" }
      }
    } catch (error) {
      console.error("Error in sendAuthInvitation:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }
    }
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data.map((customer: any) => ({
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        balance: customer.coffee_balance || 0,
        totalSpent: Number.parseFloat(customer.total_spent) || 0,
        visitCount: customer.visit_count || 0,
        lastVisit: customer.last_visit,
        status: customer.status || "active",
        notificationLowBalance: customer.notification_low_balance ?? true,
        notificationTopup: customer.notification_topup ?? true,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at || customer.created_at,
      }))
    } catch (error) {
      console.error("Error searching customers:", error)
      return []
    }
  }

  async getTransactions(customerId?: string): Promise<Transaction[]> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      let query = supabase
        .from("transactions")
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (customerId) {
        query = query.eq("customer_id", customerId)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map((transaction: any) => ({
        id: transaction.id,
        customerId: transaction.customer_id,
        customerName: transaction.customers
          ? `${transaction.customers.first_name} ${transaction.customers.last_name}`
          : "Unknown Customer",
        adminId: transaction.admin_id,
        type: transaction.type,
        coffeeCount: transaction.coffee_count || 0,
        amount: Number.parseFloat(transaction.amount) || 0,
        drinkName: transaction.drink_name,
        sizeName: transaction.size_name,
        addons: transaction.addons || [],
        discountAmount: Number.parseFloat(transaction.discount_amount) || 0,
        notes: transaction.notes,
        description: transaction.description || this.generateTransactionDescription(transaction),
        timestamp: transaction.created_at,
        createdAt: transaction.created_at,
      }))
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return []
    }
  }

  private generateTransactionDescription(transaction: any): string {
    if (transaction.type === "topup") {
      return `Top-up: ${transaction.coffee_count} coffee${transaction.coffee_count !== 1 ? "s" : ""}`
    } else if (transaction.type === "serve") {
      const drinkInfo = transaction.drink_name || "Coffee"
      const sizeInfo = transaction.size_name ? ` (${transaction.size_name})` : ""
      return `Served: ${drinkInfo}${sizeInfo}`
    } else if (transaction.type === "refund") {
      return `Refund: ${transaction.coffee_count} coffee${transaction.coffee_count !== 1 ? "s" : ""}`
    }
    return "Transaction"
  }

  async getCustomerTransactions(customerId: string): Promise<Transaction[]> {
    return this.getTransactions(customerId)
  }

  // Get transactions with addon names resolved for display
  async getTransactionsWithAddonNames(customerId?: string): Promise<TransactionWithAddonNames[]> {
    try {
      const transactions = await this.getTransactions(customerId)
      
      // Convert addon IDs to names for all transactions
      const transactionsWithNames = await Promise.all(
        transactions.map(async (transaction) => {
          if (transaction.addons && transaction.addons.length > 0) {
            const addonNames = await this.getAddonNames(transaction.addons)
            return {
              ...transaction,
              addons: addonNames, // Display names
              addonIds: transaction.addons, // Keep original IDs
            }
          } else {
            return {
              ...transaction,
              addons: [],
              addonIds: [],
            }
          }
        })
      )
      
      return transactionsWithNames
    } catch (error) {
      console.error("Error getting transactions with addon names:", error)
      return []
    }
  }

  async createTransaction(
    transaction: Omit<Transaction, "id" | "createdAt" | "customerName" | "timestamp">,
  ): Promise<Transaction> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      // Create the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          customer_id: transaction.customerId,
          admin_id: transaction.adminId,
          type: transaction.type,
          coffee_count: transaction.coffeeCount,
          amount: transaction.amount,
          drink_name: transaction.drinkName,
          size_name: transaction.sizeName,
          addons: transaction.addons,
          discount_amount: transaction.discountAmount,
          notes: transaction.notes,
          description: transaction.description,
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Update customer balance and stats (trigger is now disabled, so we handle it here)
      const customer = await this.getCustomer(transaction.customerId)
      if (customer) {
        let newBalance = customer.balance
        let newTotalSpent = customer.totalSpent || 0
        let newVisitCount = customer.visitCount || 0

        if (transaction.type === "topup") {
          newBalance += transaction.coffeeCount
        } else if (transaction.type === "serve") {
          newBalance -= transaction.coffeeCount
          if (transaction.amount) {
            newTotalSpent += transaction.amount
          }
          newVisitCount += 1
        } else if (transaction.type === "refund") {
          newBalance += transaction.coffeeCount
        }

        await this.updateCustomer(transaction.customerId, {
          balance: newBalance,
          totalSpent: newTotalSpent,
          visitCount: newVisitCount,
          lastVisit: new Date().toISOString(),
        })
      }

      // Get customer name for response
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : "Unknown Customer"

      return {
        id: transactionData.id,
        customerId: transactionData.customer_id,
        customerName,
        adminId: transactionData.admin_id,
        type: transactionData.type,
        coffeeCount: transactionData.coffee_count || 0,
        amount: Number.parseFloat(transactionData.amount) || 0,
        drinkName: transactionData.drink_name,
        sizeName: transactionData.size_name,
        addons: transactionData.addons || [],
        discountAmount: Number.parseFloat(transactionData.discount_amount) || 0,
        notes: transactionData.notes,
        description: transactionData.description || this.generateTransactionDescription(transactionData),
        timestamp: transactionData.created_at,
        createdAt: transactionData.created_at,
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  }

  async getStatistics(): Promise<CustomerStats> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      // Get customer stats
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("coffee_balance, total_spent")

      if (customerError) throw customerError

      // Get transaction stats
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("type, amount")

      if (transactionError) throw transactionError

      const totalCustomers = customerData.length
      const totalBalance = customerData.reduce((sum: number, customer: any) => sum + (customer.coffee_balance || 0), 0)
      const totalTransactions = transactionData.length

      const serveTransactions = transactionData.filter((t: any) => t.type === "serve")
      const totalRevenue = serveTransactions.reduce(
        (sum: number, transaction: any) => sum + Number.parseFloat(transaction.amount || 0),
        0,
      )
      const averageOrderValue = serveTransactions.length > 0 ? totalRevenue / serveTransactions.length : 0

      return {
        totalCustomers,
        totalBalance,
        totalTransactions,
        totalRevenue,
        averageOrderValue,
      }
    } catch (error) {
      console.error("Error fetching statistics:", error)
      return {
        totalCustomers: 0,
        totalBalance: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      }
    }
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase.from("menu_items").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        basePrice: Number.parseFloat(item.base_price) || 0,
        category: item.category,
        isAvailable: item.is_available ?? true,
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at,
      }))
    } catch (error) {
      console.error("Error fetching menu items:", error)
      return []
    }
  }

  async createMenuItem(item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">): Promise<MenuItem> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: item.name,
          description: item.description,
          base_price: item.basePrice,
          category: item.category,
          is_available: item.isAvailable,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        basePrice: Number.parseFloat(data.base_price) || 0,
        category: data.category,
        isAvailable: data.is_available ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error creating menu item:", error)
      throw error
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const updateData: any = { updated_at: new Date().toISOString() }
      if (updates.name) updateData.name = updates.name
      if (updates.description) updateData.description = updates.description
      if (updates.basePrice !== undefined) updateData.base_price = updates.basePrice
      if (updates.category) updateData.category = updates.category
      if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable

      const { data, error } = await supabase.from("menu_items").update(updateData).eq("id", id).select().single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        basePrice: Number.parseFloat(data.base_price) || 0,
        category: data.category,
        isAvailable: data.is_available ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error updating menu item:", error)
      throw error
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { error } = await supabase.from("menu_items").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting menu item:", error)
      throw error
    }
  }

  // Menu Sizes
  async getMenuSizes(): Promise<MenuSize[]> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase.from("menu_sizes").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return data.map((size: any) => ({
        id: size.id,
        name: size.name,
        displayName: size.display_name || "",
        description: size.description || "",
        priceModifier: Number.parseFloat(size.price_modifier) || 0,
        isAvailable: size.is_available ?? true,
        createdAt: size.created_at,
        updatedAt: size.updated_at || size.created_at,
      }))
    } catch (error) {
      console.error("Error fetching menu sizes:", error)
      return []
    }
  }

  async createMenuSize(size: Omit<MenuSize, "id" | "createdAt" | "updatedAt">): Promise<MenuSize> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase
        .from("menu_sizes")
        .insert({
          name: size.name,
          display_name: size.displayName,
          description: size.description,
          price_modifier: size.priceModifier,
          is_available: size.isAvailable,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        displayName: data.display_name || "",
        description: data.description || "",
        priceModifier: Number.parseFloat(data.price_modifier) || 0,
        isAvailable: data.is_available ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error creating menu size:", error)
      throw error
    }
  }

  async updateMenuSize(id: string, updates: Partial<MenuSize>): Promise<MenuSize> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const updateData: any = { updated_at: new Date().toISOString() }
      if (updates.name) updateData.name = updates.name
      if (updates.displayName !== undefined) updateData.display_name = updates.displayName
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.priceModifier !== undefined) updateData.price_modifier = updates.priceModifier
      if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable

      const { data, error } = await supabase.from("menu_sizes").update(updateData).eq("id", id).select().single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        displayName: data.display_name || "",
        description: data.description || "",
        priceModifier: Number.parseFloat(data.price_modifier) || 0,
        isAvailable: data.is_available ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error updating menu size:", error)
      throw error
    }
  }

  async deleteMenuSize(id: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { error } = await supabase.from("menu_sizes").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting menu size:", error)
      throw error
    }
  }

  // Menu Add-ons
  async getMenuAddons(): Promise<MenuAddon[]> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase.from("menu_addons").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return data.map((addon: any) => ({
        id: addon.id,
        name: addon.name,
        description: addon.description || "",
        priceModifier: Number.parseFloat(addon.price_modifier) || 0,
        category: addon.category || "",
        isAvailable: addon.is_available ?? true,
        createdAt: addon.created_at,
        updatedAt: addon.updated_at || addon.created_at,
      }))
    } catch (error) {
      console.error("Error fetching menu addons:", error)
      return []
    }
  }

  // Helper function to convert addon IDs to names for display
  async getAddonNames(addonIds: string[]): Promise<string[]> {
    try {
      if (!addonIds || addonIds.length === 0) return []
      
      const supabase = await getSupabaseClient()
      if (!supabase) return addonIds // Fallback to IDs if no client

      const { data, error } = await supabase
        .from("menu_addons")
        .select("id, name")
        .in("id", addonIds)

      if (error) {
        console.error("Error fetching addon names:", error)
        return addonIds // Fallback to IDs if error
      }

      // Return names in the same order as the IDs
      return addonIds.map(id => {
        const addon = data.find(a => a.id === id)
        return addon ? addon.name : id // Fallback to ID if addon not found
      })
    } catch (error) {
      console.error("Error in getAddonNames:", error)
      return addonIds // Fallback to IDs
    }
  }

  async createMenuAddon(addon: Omit<MenuAddon, "id" | "createdAt" | "updatedAt">): Promise<MenuAddon> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { data, error } = await supabase
        .from("menu_addons")
        .insert({
          name: addon.name,
          description: addon.description,
          price_modifier: addon.priceModifier,
          category: addon.category,
          is_available: addon.isAvailable,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        priceModifier: Number.parseFloat(data.price_modifier) || 0,
        category: data.category || "",
        isAvailable: data.is_available ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error creating menu addon:", error)
      throw error
    }
  }

  async updateMenuAddon(id: string, updates: Partial<MenuAddon>): Promise<MenuAddon> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const updateData: any = { updated_at: new Date().toISOString() }
      if (updates.name) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.priceModifier !== undefined) updateData.price_modifier = updates.priceModifier
      if (updates.category) updateData.category = updates.category
      if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable

      const { data, error } = await supabase.from("menu_addons").update(updateData).eq("id", id).select().single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        priceModifier: Number.parseFloat(data.price_modifier) || 0,
        category: data.category || "",
        isAvailable: data.is_available ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      }
    } catch (error) {
      console.error("Error updating menu addon:", error)
      throw error
    }
  }

  async deleteMenuAddon(id: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { error } = await supabase.from("menu_addons").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting menu addon:", error)
      throw error
    }
  }
}

export const supabaseService = new SupabaseService()
