"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

const RecentTransactions: React.FC = () => {
  const supabase = useSupabaseClient()
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching transactions:", error)
      } else {
        setTransactions(data)
      }
    }

    fetchTransactions()
  }, [supabase])

  return (
    <div>
      <h2>Recent Transactions</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description} - ${transaction.amount}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { RecentTransactions }
export default RecentTransactions
