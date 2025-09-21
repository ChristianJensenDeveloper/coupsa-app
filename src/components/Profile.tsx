import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Smartphone, Mail, Edit, LogOut, Key, Save, Trash2 } from "lucide-react";
import { User as UserType } from "./types";
import { toast } from "sonner@2.0.3";

interface ProfileProps {
  user: UserType | null;
  onLogout: () => void;
}

export function Profile({ user, onLogout }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 -m-3 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-500 to-blue-500 dark:from-white dark:via-blue-400 dark:to-blue-400 bg-clip-text text-transparent mb-1">
                Profile
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Please log in to view your profile
              </p>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sign In Required</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Sign in to access your profile and saved deals
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    // Here you would normally save to backend
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    // Here you would normally validate current password and save new one
    toast.success("Password changed successfully!");
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const getLoginMethodIcon = () => {
    switch (user.loginMethod) {
      case 'facebook':
        return '📘';
      case 'google':
        return '🔍';
      case 'apple':
        return '🍎';
      case 'email':
        return '✉️';
    }
  };

  const getLoginMethodLabel = () => {
    switch (user.loginMethod) {
      case 'facebook':
        return 'Facebook';
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple';
      case 'email':
        return 'Email';
    }
  };

  const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 -m-3 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-500 to-blue-500 dark:from-white dark:via-blue-400 dark:to-blue-400 bg-clip-text text-transparent mb-1">
              Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Your personal information and account settings
            </p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center shadow-md">
              <User className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.name || 'Deal Hunter'}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Member since {joinDate}</p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Personal Details</h3>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLoginMethodIcon()}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">Login Method</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 text-blue-500 dark:text-blue-400">{getLoginMethodLabel()}</Badge>
            </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} className="flex-1 bg-blue-500 hover:bg-blue-500 text-white rounded-xl shadow-md">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Full Name</span>
                </div>
                <span className="text-sm font-medium">{user.name || 'Not provided'}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Phone Number</span>
                </div>
                <span className="text-sm font-medium">{user.phoneNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email Address</span>
                </div>
                <span className="text-sm font-medium">{user.email || 'Not provided'}</span>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Password Section - Only for email login users */}
        {user.loginMethod === 'email' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Password & Security</h3>
              {!isChangingPassword && (
                <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)} className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              )}
            </div>
            <div>
            {isChangingPassword ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} className="flex-1 bg-blue-500 hover:bg-blue-500 text-white rounded-xl shadow-md">
                    Update Password
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }} className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Password</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">••••••••</span>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border-red-200 dark:border-red-800" onClick={() => {
              // Here you would normally show a confirmation dialog and handle account deletion
              toast.error("Account deletion requires admin approval. Please contact support.");
            }}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Account
            </Button>
            
            <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}