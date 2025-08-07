"use client"

import { Search, X, Users, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CustomerSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  resultCount: number
  totalCount: number
  isSearching: boolean
  hasQuery: boolean
}

export function CustomerSearch({
  searchQuery,
  onSearchChange,
  onClearSearch,
  resultCount,
  totalCount,
  isSearching,
  hasQuery,
}: CustomerSearchProps) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
          )}
        </div>
        <Input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:border-gray-400 focus:shadow-lg focus:shadow-blue-100"
        />
        <div
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-200 ease-in-out ${
            hasQuery ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="h-8 w-8 p-0 hover:bg-gray-100 hover:scale-110 transition-all duration-150 ease-in-out"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Results Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-xs text-gray-600 transition-all duration-200 ease-in-out">
            <Users
              className={`w-3 h-3 mr-2 transition-colors duration-200 ${
                isSearching ? "text-blue-500" : "text-gray-500"
              }`}
            />
            <span className="transition-all duration-200 ease-in-out">
              {isSearching ? (
                <span className="text-blue-600 animate-pulse">Searching...</span>
              ) : hasQuery ? (
                <span>
                  Showing <span className="font-medium text-blue-600">{resultCount}</span> of {totalCount} customers
                </span>
              ) : (
                <span>{totalCount} total customers</span>
              )}
            </span>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out ${
              hasQuery && !isSearching ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 -translate-x-2"
            }`}
          >
            {hasQuery && !isSearching && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors duration-150"
              >
                "{searchQuery}"
              </Badge>
            )}
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            hasQuery ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-75 translate-x-2"
          }`}
        >
          {/* {hasQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSearch}
              className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent hover:border-gray-400 hover:scale-105 transition-all duration-150 ease-in-out"
            >
              Clear search
            </Button>
          )} */}
        </div>
      </div>
    </div>
  )
}
