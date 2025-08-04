"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Loader2 } from "lucide-react"
import { pricingConfig } from "@/lib/pricing-config"
import { supabaseService, type MenuItem, type MenuSize, type MenuAddon } from "@/lib/supabase-service"

interface TopUpFormProps {
  onTopUp: (
    coffeeCount: number,
    notes?: string,
    drinkName?: string,
    sizeName?: string,
    addons?: string[],
  ) => Promise<void>
  isLoading?: boolean
}

export function TopUpForm({ onTopUp, isLoading = false }: TopUpFormProps) {
  const [coffeeCount, setCoffeeCount] = useState(1)
  const [notes, setNotes] = useState("")
  const [drinkType, setDrinkType] = useState("")
  const [size, setSize] = useState("")
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  // Menu data from Supabase
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuSizes, setMenuSizes] = useState<MenuSize[]>([])
  const [menuAddons, setMenuAddons] = useState<MenuAddon[]>([])
  const [isMenuLoading, setIsMenuLoading] = useState(true)

  // Load menu data from Supabase
  useEffect(() => {
    async function loadMenuData() {
      setIsMenuLoading(true)
      try {
        const [items, sizes, addons] = await Promise.all([
          supabaseService.getMenuItems(),
          supabaseService.getMenuSizes(),
          supabaseService.getMenuAddons(),
        ])

        setMenuItems(items.filter((item) => item.isAvailable))
        setMenuSizes(sizes.filter((size) => size.isAvailable))
        setMenuAddons(addons.filter((addon) => addon.isAvailable))

        // Set defaults if available
        if (items.length > 0) setDrinkType(items[0].id)
        if (sizes.length > 0) setSize(sizes[0].id)
      } catch (error) {
        console.error("Error loading menu data:", error)
      } finally {
        setIsMenuLoading(false)
      }
    }

    loadMenuData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (coffeeCount > 0) {
      const selectedDrink = menuItems.find((item) => item.id === drinkType)
      const selectedSize = menuSizes.find((s) => s.id === size)

      await onTopUp(coffeeCount, notes, selectedDrink?.name, selectedSize?.name, selectedAddons)

      setCoffeeCount(1)
      setNotes("")
      setSelectedAddons([])
    }
  }

  const calculateTotal = () => {
    // Base price from selected drink
    const selectedDrink = menuItems.find((item) => item.id === drinkType)
    let basePrice = selectedDrink?.basePrice || pricingConfig.defaultCoffeePrice

    // Apply size modifier
    const selectedSize = menuSizes.find((s) => s.id === size)
    if (selectedSize) {
      basePrice += selectedSize.priceModifier
    }

    // Add addon prices
    const addonTotal = selectedAddons.reduce((total, addonId) => {
      const addon = menuAddons.find((a) => a.id === addonId)
      return total + (addon?.priceModifier || 0)
    }, 0)

    return (basePrice + addonTotal) * coffeeCount
  }

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Add Coffee Credits</span>
        </CardTitle>
        <CardDescription>Add coffee credits to customer's account</CardDescription>
      </CardHeader>
      <CardContent>
        {isMenuLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading menu options...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drink-type">Drink Type</Label>
              <Select value={drinkType} onValueChange={setDrinkType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drink type" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - ${item.basePrice.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {menuSizes.map((sizeOption) => (
                    <SelectItem key={sizeOption.id} value={sizeOption.id}>
                      {sizeOption.displayName || sizeOption.name} {sizeOption.priceModifier > 0 && `(+$${sizeOption.priceModifier.toFixed(2)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Add-ons</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {menuAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`addon-${addon.id}`}
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={() => handleAddonToggle(addon.id)}
                    />
                    <Label htmlFor={`addon-${addon.id}`} className="text-sm cursor-pointer">
                      {addon.name} (+${addon.priceModifier.toFixed(2)})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coffee-count">Number of Coffees</Label>
              <Select value={coffeeCount.toString()} onValueChange={(value) => setCoffeeCount(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 10, 15, 20].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} Coffee{count !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this top-up..."
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {coffeeCount} coffee{coffeeCount !== 1 ? "s" : ""} with selected options
              </p>
            </div>

            <Button type="submit" disabled={isLoading || coffeeCount < 1} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Add {coffeeCount} Coffee{coffeeCount !== 1 ? "s" : ""}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
