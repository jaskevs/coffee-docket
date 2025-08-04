"use client"

import { useState, useEffect, useMemo } from "react"
import { supabaseService } from "@/lib/supabase-service"
import type { Customer } from "@/lib/supabase-service"

export function useDebouncedSearch(initialCustomers: Customer[] = []) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const results = await supabaseService.searchCustomers(debouncedQuery)
        setSearchResults(results)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  // Determine which customers to show
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialCustomers
    }
    return searchResults
  }, [searchQuery, initialCustomers, searchResults])

  const clearSearch = () => {
    setSearchQuery("")
    setDebouncedQuery("")
    setSearchResults([])
    setIsSearching(false)
  }

  const hasQuery = searchQuery.trim().length > 0

  return {
    searchQuery,
    setSearchQuery,
    filteredCustomers,
    isSearching,
    clearSearch,
    hasQuery,
  }
}
