"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Coffee, DollarSign, ArrowLeft } from "lucide-react"
import { MenuItemForm } from "./menu-item-form"
import { SizeForm } from "./size-form"
import { AddOnForm } from "./add-on-form"
import { supabaseService, type MenuItem, type MenuSize, type MenuAddon } from "@/lib/supabase-service"

interface MenuManagementProps {
  onNavigate: (page: string) => void
}

const menuCategories = [
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "tea", name: "Tea", icon: "🍵" },
  { id: "cold", name: "Cold Drinks", icon: "🧊" },
  { id: "pastry", name: "Pastries", icon: "🥐" },
]

export function MenuManagement({ onNavigate }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [sizes, setSizes] = useState<MenuSize[]>([])
  const [addons, setAddons] = useState<MenuAddon[]>([])
  const [showItemForm, setShowItemForm] = useState(false)
  const [showSizeForm, setShowSizeForm] = useState(false)
  const [showAddonForm, setShowAddonForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editingSize, setEditingSize] = useState<MenuSize | null>(null)
  const [editingAddon, setEditingAddon] = useState<MenuAddon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [itemsData, sizesData, addonsData] = await Promise.all([
        supabaseService.getMenuItems(),
        supabaseService.getMenuSizes(),
        supabaseService.getMenuAddons(),
      ])
      setMenuItems(itemsData)
      setSizes(sizesData)
      setAddons(addonsData)
    } catch (error) {
      console.error("Error loading menu data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveItem = async (item: MenuItem) => {
    try {
      if (editingItem) {
        const updatedItem = await supabaseService.updateMenuItem(item.id, item)
        setMenuItems((items) => items.map((i) => (i.id === item.id ? updatedItem : i)))
      } else {
        const newItem = await supabaseService.createMenuItem(item)
        setMenuItems((items) => [...items, newItem])
      }
      setShowItemForm(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Error saving menu item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await supabaseService.deleteMenuItem(id)
      setMenuItems((items) => items.filter((i) => i.id !== id))
    } catch (error) {
      console.error("Error deleting menu item:", error)
    }
  }

  const handleSaveSize = async (size: MenuSize) => {
    try {
      if (editingSize) {
        const updatedSize = await supabaseService.updateMenuSize(size.id, size)
        setSizes((sizes) => sizes.map((s) => (s.id === size.id ? updatedSize : s)))
      } else {
        const newSize = await supabaseService.createMenuSize(size)
        setSizes((sizes) => [...sizes, newSize])
      }
      setShowSizeForm(false)
      setEditingSize(null)
    } catch (error) {
      console.error("Error saving menu size:", error)
    }
  }

  const handleDeleteSize = async (id: string) => {
    try {
      await supabaseService.deleteMenuSize(id)
      setSizes((sizes) => sizes.filter((s) => s.id !== id))
    } catch (error) {
      console.error("Error deleting menu size:", error)
    }
  }

  const handleSaveAddon = async (addon: MenuAddon) => {
    try {
      if (editingAddon) {
        const updatedAddon = await supabaseService.updateMenuAddon(addon.id, addon)
        setAddons((addons) => addons.map((a) => (a.id === addon.id ? updatedAddon : a)))
      } else {
        const newAddon = await supabaseService.createMenuAddon(addon)
        setAddons((addons) => [...addons, newAddon])
      }
      setShowAddonForm(false)
      setEditingAddon(null)
    } catch (error) {
      console.error("Error saving menu addon:", error)
    }
  }

  const handleDeleteAddon = async (id: string) => {
    try {
      await supabaseService.deleteMenuAddon(id)
      setAddons((addons) => addons.filter((a) => a.id !== id))
    } catch (error) {
      console.error("Error deleting menu addon:", error)
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = menuCategories.find((c) => c.id === categoryId)
    return category?.icon || "📦"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading menu data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("admin-dashboard")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Coffee className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Menu Items</h2>
            <Button onClick={() => setShowItemForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge variant={item.isAvailable ? "default" : "secondary"}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item)
                          setShowItemForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{item.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">${item.basePrice.toFixed(2)}</span>
                    </div>
                    <Badge variant="outline">{menuCategories.find((c) => c.id === item.category)?.name}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sizes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sizes</h2>
            <Button onClick={() => setShowSizeForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sizes.map((size) => (
              <Card key={size.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{size.name}</h3>
                      <p className="text-sm text-gray-600">+${size.priceModifier.toFixed(2)}</p>
                      <Badge variant={size.isAvailable ? "default" : "secondary"} className="mt-1">
                        {size.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSize(size)
                          setShowSizeForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSize(size.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addons" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add-ons</h2>
            <Button onClick={() => setShowAddonForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Add-on
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <Card key={addon.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{addon.name}</h3>
                      <p className="text-sm text-gray-600">+${addon.price.toFixed(2)}</p>
                      <Badge variant={addon.isAvailable ? "default" : "secondary"} className="mt-1">
                        {addon.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingAddon(addon)
                          setShowAddonForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAddon(addon.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showItemForm && (
        <MenuItemForm
          item={editingItem}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowItemForm(false)
            setEditingItem(null)
          }}
        />
      )}

      {showSizeForm && (
        <SizeForm
          size={editingSize}
          onSave={handleSaveSize}
          onCancel={() => {
            setShowSizeForm(false)
            setEditingSize(null)
          }}
        />
      )}

      {showAddonForm && (
        <AddOnForm
          addon={editingAddon}
          onSave={handleSaveAddon}
          onCancel={() => {
            setShowAddonForm(false)
            setEditingAddon(null)
          }}
        />
      )}
    </div>
  )
}
