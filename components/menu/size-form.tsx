"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import type { SizeFormData, Size } from "@/types/menu"

interface SizeFormProps {
  size?: Size
  onSubmit: (data: SizeFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function SizeForm({ size, onSubmit, onCancel, isLoading = false }: SizeFormProps) {
  const [isActive, setIsActive] = useState(size?.isActive ?? true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SizeFormData>({
    defaultValues: {
      name: size?.name || "",
      displayName: size?.displayName || "",
      priceModifier: size?.priceModifier || 0,
      isActive: size?.isActive ?? true,
    },
  })

  const handleFormSubmit = async (data: SizeFormData) => {
    await onSubmit({
      ...data,
      isActive,
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">{size ? "Edit Size" : "Add New Size"}</CardTitle>
        <CardDescription>
          {size ? "Update the details of this size option" : "Create a new size option for menu items"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Size Name (Internal)
              </Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Size name is required",
                  pattern: {
                    value: /^[a-z-]+$/,
                    message: "Use lowercase letters and hyphens only",
                  },
                })}
                placeholder="e.g., small, medium, large"
                className="h-12"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                Display Name
              </Label>
              <Input
                id="displayName"
                {...register("displayName", {
                  required: "Display name is required",
                })}
                placeholder="e.g., Small (8oz)"
                className="h-12"
              />
              {errors.displayName && <p className="text-sm text-red-600">{errors.displayName.message}</p>}
            </div>
          </div>

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
              Amount to add to base price (use 0 for no change, negative for discount)
            </p>
            {errors.priceModifier && <p className="text-sm text-red-600">{errors.priceModifier.message}</p>}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <p className="text-xs text-gray-600">
                {isActive ? "This size is available for selection" : "This size is hidden from customers"}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-green-500" />
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
                  {size ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{size ? "Update Size" : "Create Size"}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
