import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Mail, Calendar, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface SubscriptionPreference {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  frequency: string;
  enabled: boolean;
}

interface SubscriptionPreferencesProps {
  onSave?: (preferences: SubscriptionPreference[]) => void;
  onBack?: () => void;
  isModal?: boolean;
}

export function SubscriptionPreferences({ onSave, onBack, isModal = false }: SubscriptionPreferencesProps) {
  const [preferences, setPreferences] = useState<SubscriptionPreference[]>([
    {
      id: 'cfd-deals',
      title: 'CFD Deals',
      description: 'Subscribers who want CFD prop trading deals',
      icon: TrendingUp,
      frequency: 'Monday',
      enabled: true
    },
    {
      id: 'futures-deals',
      title: 'Futures Deals', 
      description: 'Subscribers who want futures prop trading deals',
      icon: Calendar,
      frequency: 'Tuesday',
      enabled: true
    },
    {
      id: 'broker-bonuses',
      title: 'Broker Bonuses',
      description: 'Subscribers who want broker bonus offers',
      icon: Mail,
      frequency: 'Wednesday', 
      enabled: false
    },
    {
      id: 'expiring-deals',
      title: 'Expiring Deals',
      description: 'Subscribers who want urgent deal alerts',
      icon: Clock,
      frequency: 'Thursday',
      enabled: true
    }
  ]);

  const togglePreference = (id: string) => {
    setPreferences(prev => prev.map(pref => 
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    ));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(preferences);
    } else {
      // Save to localStorage or backend
      localStorage.setItem('subscriptionPreferences', JSON.stringify(preferences));
      toast.success("Subscription preferences saved!");
    }
  };

  const enabledCount = preferences.filter(p => p.enabled).length;

  const containerClass = isModal 
    ? "space-y-6 p-6" 
    : "min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 -m-3 p-3 sm:p-4";

  return (
    <div className={containerClass}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        {!isModal && (
          <div className="text-center mb-6">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-500 to-blue-500 dark:from-white dark:via-blue-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                Subscription Preferences
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Choose which types of deal alerts you want to receive
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  {enabledCount} of {preferences.length} subscriptions active
                </Badge>
              </div>
            </div>
          </div>
        )}

        {isModal && (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Subscription Preferences
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Choose which deal alerts you want to receive
            </p>
          </div>
        )}

        {/* Subscription Options */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Email Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.map((pref) => {
              const IconComponent = pref.icon;
              return (
                <div
                  key={pref.id}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                    pref.enabled 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        pref.enabled 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {pref.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          >
                            {pref.frequency}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {pref.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={() => togglePreference(pref.id)}
                      className="ml-4"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Email Frequency Summary */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                Your Email Schedule
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {preferences.filter(p => p.enabled).map(pref => (
                  <div key={pref.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">{pref.frequency}</span>
                    <span className="text-slate-500 dark:text-slate-400">{pref.title}</span>
                  </div>
                ))}
              </div>
              {enabledCount === 0 && (
                <p className="text-slate-500 dark:text-slate-400 italic">
                  No email subscriptions active
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onBack && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1 rounded-xl border-slate-300 dark:border-slate-600"
            >
              Back
            </Button>
          )}
          <Button 
            onClick={handleSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            Save Preferences
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You can change these preferences anytime in your account settings. 
            Unsubscribe links are included in every email.
          </p>
        </div>
      </div>
    </div>
  );
}