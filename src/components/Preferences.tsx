import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, MessageCircle, Smartphone, Filter } from "lucide-react";
import { CouponCategory } from "./types";
import { toast } from "sonner@2.0.3";

export function Preferences() {
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    whatsapp: false,
    sms: false
  });

  const [categoryPreferences, setCategoryPreferences] = useState<Set<CouponCategory>>(
    new Set(['CFD', 'Futures', 'Crypto', 'Brokers'])
  );

  const toggleCategoryPreference = (category: CouponCategory) => {
    const newPrefs = new Set(categoryPreferences);
    if (newPrefs.has(category)) {
      newPrefs.delete(category);
    } else {
      newPrefs.add(category);
    }
    setCategoryPreferences(newPrefs);
  };

  const handleSavePreferences = () => {
    // Here you would normally save to backend/localStorage
    // For now, we'll just show a success toast
    toast.success("Preferences saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 -m-3 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-500 to-blue-500 dark:from-white dark:via-blue-400 dark:to-blue-400 bg-clip-text text-transparent mb-1">
              Preferences
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Customize your deal discovery experience
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Notifications
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Choose how you want to be notified about new deals
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Label htmlFor="push-notifications" className="text-slate-900 dark:text-slate-100">Push Notifications</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Label htmlFor="whatsapp" className="text-slate-900 dark:text-slate-100">WhatsApp</Label>
              </div>
              <Switch
                id="whatsapp"
                checked={notifications.whatsapp}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, whatsapp: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Label htmlFor="sms" className="text-slate-900 dark:text-slate-100">SMS</Label>
              </div>
              <Switch
                id="sms"
                checked={notifications.sms}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, sms: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Category Preferences
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Select categories you're most interested in
            </p>
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['CFD', 'Futures', 'Crypto', 'Brokers'] as CouponCategory[]).map((category) => (
                <Badge
                  key={category}
                  variant={categoryPreferences.has(category) ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-xl px-4 py-2 ${
                    categoryPreferences.has(category) 
                      ? "bg-blue-500 hover:bg-blue-500 text-white border-0 shadow-md" 
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800/60"
                  }`}
                  onClick={() => toggleCategoryPreference(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Selected categories will be prioritized in your deal feed
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button className="w-full bg-blue-500 hover:bg-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] h-12" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}