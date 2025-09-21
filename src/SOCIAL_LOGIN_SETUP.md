# 🔐 REDUZED Social Login Setup Guide

This guide explains how to configure social login providers in your REDUZED app.

## ✅ **Current Implementation**

Your app now includes:
- **Real Supabase Auth Integration** - Connects to actual OAuth providers
- **Fallback to Demo Mode** - If social providers aren't configured
- **Automatic User Profile Creation** - From social login data
- **Session Management** - Persistent login state

## 🚀 **Quick Setup Steps**

### **1. Configure OAuth Providers in Supabase**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your REDUZED project: `unghlvhuvbuxygsolzrk`

2. **Navigate to Authentication > Providers**
   - Click on "Authentication" in the sidebar
   - Go to "Providers" tab

### **2. Google OAuth Setup**

1. **Enable Google Provider**
   - Toggle "Google" to enabled
   
2. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   
3. **Configure OAuth Consent Screen**
   - Application name: "REDUZED - AI Deal Finder"
   - User support email: your email
   - Developer contact: your email
   
4. **Set Authorized Redirect URIs**
   ```
   https://unghlvhuvbuxygsolzrk.supabase.co/auth/v1/callback
   ```
   
5. **Add Client ID & Secret to Supabase**
   - Copy Client ID and Client Secret from Google
   - Paste into Supabase Google provider settings

### **3. Facebook Login Setup**

1. **Enable Facebook Provider**
   - Toggle "Facebook" to enabled
   
2. **Get Facebook App Credentials**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app or select existing
   - Add "Facebook Login" product
   
3. **Configure Facebook Login**
   - Valid OAuth Redirect URIs:
   ```
   https://unghlvhuvbuxygsolzrk.supabase.co/auth/v1/callback
   ```
   
4. **Add App ID & Secret to Supabase**
   - Copy App ID and App Secret from Facebook
   - Paste into Supabase Facebook provider settings

### **4. Apple Sign In Setup**

1. **Enable Apple Provider**
   - Toggle "Apple" to enabled
   
2. **Get Apple Credentials**
   - Go to [Apple Developer](https://developer.apple.com/)
   - Create a Service ID
   - Enable "Sign in with Apple"
   - Configure domains and redirect URLs
   
3. **Set Redirect URL**
   ```
   https://unghlvhuvbuxygsolzrk.supabase.co/auth/v1/callback
   ```
   
4. **Add Credentials to Supabase**
   - Service ID, Team ID, Key ID, and Private Key

## 🔧 **Testing Your Setup**

### **1. Test Social Login**
- Click any social login button in your app
- Should redirect to the provider's login page
- After login, should return to your app with user authenticated

### **2. Verify User Data**
- Check that user name and email are populated
- Verify the login method is correctly identified
- Confirm saved deals are created for new users

### **3. Test Logout**
- Should clear all user data
- Should redirect to login state
- Should show success toast

## 📱 **Mobile App Considerations**

If you plan to create mobile apps:

### **iOS App**
- Add URL scheme for Apple Sign In
- Configure associated domains
- Add Apple Sign In capability

### **Android App**
- Add Google Sign In SHA certificates
- Configure package name in Google Console
- Add Facebook app hash for Android

## 🔒 **Security Best Practices**

### **1. Domain Verification**
- Only add your actual domains to OAuth settings
- Use HTTPS for all redirect URLs
- Keep Client Secrets secure

### **2. Scope Permissions**
- Request minimal necessary permissions
- Clearly explain why you need each permission
- Allow users to review permissions

### **3. Data Protection**
- Follow GDPR compliance for EU users
- Implement proper consent management
- Allow users to delete their data

## 🚨 **Common Issues & Solutions**

### **"Invalid Redirect URI" Error**
- **Problem**: OAuth redirect URL doesn't match configured URL
- **Solution**: Ensure exact match including https:// and trailing slashes

### **"Client ID Not Valid" Error**
- **Problem**: Wrong Client ID or Secret
- **Solution**: Double-check credentials in provider console

### **"App Not Approved" Error**
- **Problem**: Facebook/Google app needs verification for production
- **Solution**: Submit app for review with required information

### **Social Login Buttons Don't Work**
- **Problem**: Providers not configured in Supabase
- **Solution**: Complete provider setup in Supabase dashboard

## 📊 **Analytics Integration**

Your social login will automatically track:
- **Login Method**: Google, Facebook, Apple, Email
- **User Registration**: New vs returning users
- **Geographic Data**: Country/region of users
- **Session Duration**: How long users stay logged in

## 🎯 **Next Steps**

1. **Configure at least Google OAuth** (most popular)
2. **Test the login flow** end-to-end
3. **Add Facebook** for broader reach
4. **Consider Apple Sign In** for iOS users
5. **Monitor analytics** to see which methods users prefer

## 💡 **Pro Tips**

- **Start with Google**: Easiest to set up and most widely used
- **Test in Incognito**: Verify login works for new users
- **Mobile First**: Ensure social login works on mobile devices
- **Error Handling**: App gracefully falls back to demo mode if providers fail
- **User Experience**: Social login should feel seamless and fast

---

**Need Help?** 
- Check Supabase Auth documentation
- Test with your own social accounts first
- Monitor browser console for detailed error messages