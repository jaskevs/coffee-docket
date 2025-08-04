"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import { menuCategories } from "@/lib/menu-data" 
import type { MenuFormData, MenuItem } from "@/types/menu"

interface MenuItemFormProps {
  item?: MenuItem
  onSubmit: (data: MenuFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function MenuItemForm({ item, onSubmit, onCancel, isLoading = false }: MenuItemFormProps) {
  const [ingredients, setIngredients] = useState<string[]>(item?.ingredients || [])
  const [newIngredient, setNewIngredient] = useState("")
  const [isActive, setIsActive] = useState(item?.isActive ?? true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MenuFormData>({
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      basePrice: item?.basePrice || 0,
      category: item?.category || "",
      ingredients: item?.ingredients || [],
      isActive: item?.isActive ?? true,
    },
  })

  const selectedCategory = watch("category")

  const handleFormSubmit = async (data: MenuFormData) => {
    await onSubmit({
      ...data,
      ingredients,
      isActive,
    })
  }

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient("")
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addIngredient()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          {item ? "Edit Menu Item" : "Add New Menu Item"}
        </CardTitle>
        <CardDescription>
          {item ? "Update the details of this menu item" : "Create a new item for your menu"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Item Name
              </Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Item name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                placeholder="Enter item name"
                className="h-12"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                })}
                placeholder="Describe this menu item"
                className="min-h-[100px] resize-none"
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice" className="text-sm font-medium text-gray-700">
                  Base Price ($)
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("basePrice", {
                    required: "Base price is required",
                    min: {
                      value: 0,
                      message: "Price must be positive",
                    },
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                  className="h-12"
                />
                {errors.basePrice && <p className="text-sm text-red-600">{errors.basePrice.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Ingredients</Label>
              <div className="flex space-x-2">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add ingredient"
                  className="flex-1 h-10"
                />
                <Button
                  type="button"
                  onClick={addIngredient}
                  disabled={!newIngredient.trim()}
                  className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-300"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <p className="text-xs text-gray-600">
                {isActive ? "This item is visible to customers" : "This item is hidden from customers"}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-green-500" />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {item ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{item ? "Update Item" : "Create Item"}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
