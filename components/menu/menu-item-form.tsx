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
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { menuCategories } from "@/lib/menu-data" 
import type { MenuItem } from "@/lib/supabase-service"

interface MenuItemFormProps {
  item?: MenuItem | null
  onSave: (item: MenuItem) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface MenuFormData {
  name: string
  description: string
  basePrice: number
  category: string
  isAvailable: boolean
}

export function MenuItemForm({ item, onSave, onCancel, isLoading = false }: MenuItemFormProps) {
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true)

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
    },
  })

  const selectedCategory = watch("category")

  const handleFormSubmit = async (data: MenuFormData) => {
    await onSave({
      ...item,
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      category: data.category,
      isAvailable,
    } as MenuItem)
  }


  return (
    <div className="w-full">
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

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <p className="text-xs text-gray-600">
                {isAvailable ? "This item is visible to customers" : "This item is hidden from customers"}
              </p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} className="data-[state=checked]:bg-green-500" />
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
    </div>
  )
}
