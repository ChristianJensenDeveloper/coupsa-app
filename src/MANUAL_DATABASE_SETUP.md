# 🔧 Manual Database Setup for KOOCAO

Your database setup failed because the automatic method requires a special RPC function. Here's how to fix it manually:

## 🚀 **Quick Fix (5 minutes)**

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your KOOCAO project
3. Click **"SQL Editor"** in the left sidebar

### **Step 2: Run the Setup SQL**
1. Click **"New Query"** button
2. Copy the entire contents of `QUICK_FIX_DATABASE.sql`
3. Paste into the SQL editor
4. Click **"Run"** button

### **Step 3: Verify Success**
1. Go back to your KOOCAO app
2. Menu → Debug Database
3. Click **"Check Database"**
4. You should see ✅ **green checkmarks** for both tables

## 📊 **What This Creates:**

✅ **companies** table (3 demo companies)
- Demo PropFirm Alpha (Pending)
- Demo Crypto Exchange (Approved)  
- Demo Futures Broker (Rejected)

✅ **broker_deals** table (2 demo deals)
- 50% Off Trading Challenge (CFD)
- Free Trading for 30 Days (Crypto)

✅ **Proper permissions** and indexes
✅ **Row Level Security** policies

## 🎯 **Expected Result:**

After running the SQL, your admin panel will show:
- **Total Companies: 3**
- **Pending: 1, Approved: 1, Rejected: 1**  
- **No more PGRST205 errors!**

## ❓ **Still Having Issues?**

The `QUICK_FIX_DATABASE.sql` file contains all the SQL you need. If you can't find it, here's the essential setup:

```sql
-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  website VARCHAR(255),
  categories TEXT[] DEFAULT '{}',
  country VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  user_id UUID,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on companies" ON public.companies FOR ALL USING (true);
```

**Just run the complete `QUICK_FIX_DATABASE.sql` file for the full setup!** 🎉