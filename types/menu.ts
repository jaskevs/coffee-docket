export interface MenuItem {
  id: string
  name: string
  description: string
  basePrice: number
  category: "coffee" | "tea" | "cold" | "pastry"
  isActive: boolean
  image?: string
  ingredients?: string[]
}

export interface Size {
  id: string
  name: string
  displayName: string
  priceModifier: number
  isActive: boolean
}

export interface AddOn {
  id: string
  name: string
  description: string
  priceModifier: number
  category: "milk" | "syrup" | "extra" | "dietary"
  isActive: boolean
}

export interface MenuCategory {
  id: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
}

export interface MenuFormData {
  name: string
  description: string
  basePrice: number
  category: string
  ingredients: string[]
  isActive: boolean
}

export interface SizeFormData {
  name: string
  displayName: string
  priceModifier: number
  isActive: boolean
}

export interface AddOnFormData {
  name: string
  description: string
  priceModifier: number
  category: string
  isActive: boolean
}
