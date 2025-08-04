"use client"

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
import type { MenuAddon } from "@/lib/supabase-service"

interface AddOnFormProps {
  addon?: MenuAddon
  onSave: (data: MenuAddon) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const addOnCategories = [
  { id: "milk", name: "Milk Alternatives" },
  { id: "syrup", name: "Syrups" },
  { id: "extra", name: "Extras" },
  { id: "dietary", name: "Dietary Options" },
]

export function AddOnForm({ addon, onSave, onCancel, isLoading = false }: AddOnFormProps) {
  const [isAvailable, setIsAvailable] = useState(addon?.isAvailable ?? true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MenuAddon>({
    defaultValues: {
      id: addon?.id || "",
      name: addon?.name || "",
      description: addon?.description || "",
      priceModifier: addon?.priceModifier || 0,
      category: addon?.category || "",
      isAvailable: addon?.isAvailable ?? true,
      createdAt: addon?.createdAt || "",
      updatedAt: addon?.updatedAt || "",
    },
  })

  const selectedCategory = watch("category")


  const handleFormSubmit = async (data: MenuAddon) => {
    await onSave({
      ...data,
      isAvailable,
    })
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Add-on Name
              </Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Add-on name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                placeholder="Enter add-on name"
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
                    value: 5,
                    message: "Description must be at least 5 characters",
                  },
                })}
                placeholder="Describe this add-on"
                className="min-h-[80px] resize-none"
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceModifier" className="text-sm font-medium text-gray-700">
                  Price Modifier ($)
                </Label>
                <Input
                  id="priceModifier"
                  type="number"
                  step="0.01"
                  {...register("priceModifier", {
                    required: "Price modifier is required",
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                  className="h-12"
                />
                <p className="text-xs text-gray-500">
                  Amount to add to base price (use 0 for free, negative for discount)
                </p>
                {errors.priceModifier && <p className="text-sm text-red-600">{errors.priceModifier.message}</p>}
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
                    {addOnCategories.map((category) => (
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <p className="text-xs text-gray-600">
                {isAvailable ? "This add-on is available for selection" : "This add-on is hidden from customers"}
              </p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} className="data-[state=checked]:bg-green-500" />
          </div>

          <Separator />

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
                  {addon ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{addon ? "Update Add-on" : "Create Add-on"}</>
              )}
            </Button>
          </div>
        </form>
    </div>
  )
}
