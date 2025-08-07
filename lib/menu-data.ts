import type { MenuItem, MenuSize, MenuAddon } from "@/types/menu"

export const menuCategories = [
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "tea", name: "Tea", icon: "🍵" },
  { id: "pastries", name: "Pastries", icon: "🥐" },
  { id: "sandwiches", name: "Sandwiches", icon: "🥪" },
]

export const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Espresso",
    description: "Rich and bold espresso shot",
    category: "coffee",
    basePrice: 2.5,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam",
    category: "coffee",
    basePrice: 4.0,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Latte",
    description: "Espresso with steamed milk",
    category: "coffee",
    basePrice: 4.5,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Green Tea",
    description: "Fresh green tea leaves",
    category: "tea",
    basePrice: 3.0,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Croissant",
    description: "Buttery, flaky pastry",
    category: "pastry",
    basePrice: 3.5,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockSizes: MenuSize[] = [
  {
    id: "1",
    name: "Small",
    displayName: "Small",
    priceModifier: 0,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Medium",
    displayName: "Medium",
    priceModifier: 0.5,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Large",
    displayName: "Large",
    priceModifier: 1.0,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockAddons: MenuAddon[] = [
  {
    id: "1",
    name: "Extra Shot",
    priceModifier: 0.75,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Oat Milk",
    priceModifier: 0.5,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Vanilla Syrup",
    priceModifier: 0.5,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Whipped Cream",
    priceModifier: 0.5,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
