# 🗄️ Database Setup Instructions for KOOCAO Admin

## ❗ Issue: Database Tables Missing

You're seeing these errors because the required database tables haven't been created yet:
- `Could not find the table 'public.companies'`
- `Could not find the table 'public.broker_deals'`

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your KOOCAO project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Setup Script
1. Copy the **entire contents** of the file `/SETUP_COMPANIES_DATABASE.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
4. You should see: `"Companies database setup completed successfully!"`

### Step 3: Verify Setup
1. Go to **"Table Editor"** in Supabase
2. You should now see these tables:
   - ✅ `companies` 
   - ✅ `broker_deals`

### Step 4: Test Admin Panel
1. Go back to your app
2. Navigate to Admin Mode → Companies
3. You should now see the demo companies and no errors! 🎉

## 📊 What Gets Created

### Tables:
- **`companies`** - Stores company registrations and admin approvals
- **`broker_deals`** - Stores deals submitted by companies

### Security:
- **Row Level Security (RLS)** policies for data protection
- **Indexes** for better performance
- **Proper foreign key relationships**

### Demo Data:
- 2 demo companies (1 pending, 1 approved)
- 1 demo broker deal (pending approval)

## 🛠️ Manual Setup (Alternative)

If you prefer to set up manually:

```sql
-- 1. Create companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  website VARCHAR(255),
  categories TEXT[] DEFAULT '{}',
  country VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create broker_deals table  
CREATE TABLE broker_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_approval',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_deals ENABLE ROW LEVEL SECURITY;
```

## 🎯 Expected Result

After setup, your admin panel will:
- ✅ Load companies from the database (no more errors)
- ✅ Show real company data with proper stats
- ✅ Allow approve/reject/suspend actions that actually work
- ✅ Display demo companies for testing

## ❓ Need Help?

- **File not found?** The setup SQL is in `/SETUP_COMPANIES_DATABASE.sql`
- **SQL errors?** Make sure you're in the right Supabase project
- **Still seeing errors?** Check the browser console for details

## 🚀 Next Steps

Once setup is complete:
1. Test approving/rejecting demo companies
2. Try the search functionality
3. Add real companies through the broker registration flow
4. Monitor the admin analytics dashboard

**You're all set!** 🎉