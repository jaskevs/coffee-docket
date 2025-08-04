"use client"

import { useState } from "react"
import { Settings, Bell, Lock, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { UserSettings } from "@/types/dashboard"

interface SettingsPanelProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
  onChangePassword: () => void
  isLoading?: boolean
}

export function SettingsPanel({ settings, onSettingsChange, onChangePassword, isLoading = false }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleChange = (key: keyof UserSettings, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    })
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse bg-gray-200 h-12 w-full rounded"></div>
          <div className="animate-pulse bg-gray-200 h-12 w-full rounded"></div>
          <div className="animate-pulse bg-gray-200 h-12 w-full rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="text-lg font-semibold text-coffee-800 flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </h3>

              <div className="space-y-4 pl-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-balance-notifications" className="text-sm font-medium cursor-pointer">
                      Low balance alerts
                    </Label>
                    <p className="text-xs text-gray-600">
                      Get notified when you have {settings.lowBalanceThreshold} or fewer coffees left
                    </p>
                  </div>
                  <Switch
                    id="low-balance-notifications"
                    checked={settings.lowBalanceNotifications}
                    onCheckedChange={(checked) => handleToggleChange("lowBalanceNotifications", checked)}
                    className="data-[state=checked]:bg-coffee-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="topup-notifications" className="text-sm font-medium cursor-pointer">
                      Top-up confirmations
                    </Label>
                    <p className="text-xs text-gray-600">Get notified when your coffee balance is topped up</p>
                  </div>
                  <Switch
                    id="topup-notifications"
                    checked={settings.topupNotifications}
                    onCheckedChange={(checked) => handleToggleChange("topupNotifications", checked)}
                    className="data-[state=checked]:bg-coffee-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </h3>

              <div className="pl-6">
                <Button
                  variant="outline"
                  onClick={onChangePassword}
                  className="w-full h-12 text-coffee-600 border-coffee-300 hover:bg-coffee-50 hover:text-coffee-700 bg-transparent"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
