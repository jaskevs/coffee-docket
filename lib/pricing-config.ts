import type { CoffeeSize as ImportedCoffeeSize } from "@/types/auth"

export interface CoffeeAddOn {
  id: string
  name: string
  price: number
}

export interface CoffeeType {
  id: string
  name: string
  basePrice: number
  description?: string
}

export interface PricingConfig {
  coffeeTypes: CoffeeType[]
  sizes: ImportedCoffeeSize[]
  addOns: CoffeeAddOn[]
  taxRate: number
  currency: string
  defaultCoffeePrice: number
}

export const pricingConfig: PricingConfig = {
  coffeeTypes: [
    {
      id: "espresso",
      name: "Espresso",
      basePrice: 2.5,
      description: "Rich and bold espresso shot",
    },
    {
      id: "americano",
      name: "Americano",
      basePrice: 3.0,
      description: "Espresso with hot water",
    },
    {
      id: "latte",
      name: "Latte",
      basePrice: 4.5,
      description: "Espresso with steamed milk",
    },
    {
      id: "cappuccino",
      name: "Cappuccino",
      basePrice: 4.0,
      description: "Espresso with steamed milk and foam",
    },
    {
      id: "mocha",
      name: "Mocha",
      basePrice: 5.0,
      description: "Espresso with chocolate and steamed milk",
    },
    {
      id: "macchiato",
      name: "Macchiato",
      basePrice: 4.25,
      description: "Espresso with a dollop of steamed milk",
    },
  ],
  sizes: [
    {
      id: "small",
      name: "Small",
      price: 0,
      multiplier: 0.85,
    },
    {
      id: "medium",
      name: "Medium",
      price: 0,
      multiplier: 1.0,
    },
    {
      id: "large",
      name: "Large",
      price: 0.75,
      multiplier: 1.25,
    },
    {
      id: "extra-large",
      name: "Extra Large",
      price: 1.25,
      multiplier: 1.5,
    },
  ],
  addOns: [
    {
      id: "extra-shot",
      name: "Extra Shot",
      price: 0.75,
    },
    {
      id: "decaf",
      name: "Decaf",
      price: 0,
    },
    {
      id: "soy-milk",
      name: "Soy Milk",
      price: 0.5,
    },
    {
      id: "almond-milk",
      name: "Almond Milk",
      price: 0.6,
    },
    {
      id: "oat-milk",
      name: "Oat Milk",
      price: 0.65,
    },
    {
      id: "coconut-milk",
      name: "Coconut Milk",
      price: 0.55,
    },
    {
      id: "vanilla-syrup",
      name: "Vanilla Syrup",
      price: 0.5,
    },
    {
      id: "caramel-syrup",
      name: "Caramel Syrup",
      price: 0.5,
    },
    {
      id: "hazelnut-syrup",
      name: "Hazelnut Syrup",
      price: 0.5,
    },
    {
      id: "extra-hot",
      name: "Extra Hot",
      price: 0,
    },
    {
      id: "extra-foam",
      name: "Extra Foam",
      price: 0,
    },
    {
      id: "whipped-cream",
      name: "Whipped Cream",
      price: 0.75,
    },
  ],
  taxRate: 0.08, // 8% tax
  currency: "USD",
  defaultCoffeePrice: 3.5,
}

// Helper functions
export function calculateCoffeePrice(coffeeTypeId: string, sizeId: string, addOnIds: string[] = []): number {
  const coffeeType = pricingConfig.coffeeTypes.find((type) => type.id === coffeeTypeId)
  const size = pricingConfig.sizes.find((s) => s.id === sizeId)

  let basePrice = coffeeType?.basePrice || pricingConfig.defaultCoffeePrice

  // Apply size multiplier and additional cost
  if (size) {
    basePrice = basePrice * size.multiplier + size.price
  }

  // Add add-on costs
  const addOnCost = addOnIds.reduce((total, addOnId) => {
    const addOn = pricingConfig.addOns.find((a) => a.id === addOnId)
    return total + (addOn?.price || 0)
  }, 0)

  return basePrice + addOnCost
}

export function calculateTotalWithTax(subtotal: number): number {
  return subtotal * (1 + pricingConfig.taxRate)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: pricingConfig.currency,
  }).format(price)
}

// Default export for backward compatibility
export default pricingConfig

export function calculatePrice(
  coffeeTypeId: string,
  sizeId: string,
  addOnIds: string[],
  quantity: number,
  discount: number,
  discountType: "amount" | "percentage",
) {
  const coffeeType = pricingConfig.coffeeTypes.find((c) => c.id === coffeeTypeId)
  const size = pricingConfig.sizes.find((s) => s.id === sizeId)
  const selectedAddOns = pricingConfig.addOns.filter((a) => addOnIds.includes(a.id))

  if (!coffeeType || !size) {
    return {
      basePrice: 0,
      sizeModifier: 0,
      addOnModifiers: 0,
      subtotal: 0,
      discount: 0,
      finalPrice: 0,
      coffeeCredits: 0,
    }
  }

  const basePrice = coffeeType.basePrice
  const sizeModifier = size.price
  const addOnModifiers = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0)

  const itemPrice = basePrice + sizeModifier + addOnModifiers
  const subtotal = itemPrice * quantity

  let discountAmount = 0
  if (discountType === "percentage") {
    discountAmount = (subtotal * discount) / 100
  } else {
    discountAmount = discount
  }

  const finalPrice = Math.max(0, subtotal - discountAmount)
  const coffeeCredits = quantity // Each item = 1 coffee credit

  return {
    basePrice,
    sizeModifier,
    addOnModifiers,
    subtotal,
    discount: discountAmount,
    finalPrice,
    coffeeCredits,
  }
}
