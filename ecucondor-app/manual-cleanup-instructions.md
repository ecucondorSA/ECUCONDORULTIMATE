# Manual Database Cleanup Instructions for ecucondor-app

Since the automated cleanup scripts cannot access the database functions, here are the manual steps to clean up RLS policies and rules in your Supabase database.

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to https://app.supabase.com
2. Navigate to your project: `qfregiogzspihbglvpqs`
3. Go to **Database** → **Tables**

### Step 2: Disable RLS on All Tables
For each table in your public schema:
1. Click on the table name
2. Go to the **RLS** tab
3. Toggle **Row Level Security** to OFF
4. Click **Save**

### Step 3: Remove All Policies
1. Go to **Database** → **Policies**
2. Delete all policies in the public schema
3. Or go to each table → **RLS** tab → Delete all policies

### Step 4: Check Authentication Settings
1. Go to **Authentication** → **Settings**
2. Ensure **Site URL** is set to: `https://ecucondor.com`
3. Check **Redirect URLs** include:
   - `https://ecucondor.com/auth/callback`
   - `https://ecucondor.com/dashboard`
   - `http://localhost:3000/auth/callback` (for development)

## Method 2: Using SQL Editor in Supabase Dashboard

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL commands:

```sql
-- Step 1: List all tables and their RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Step 2: List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Step 3: Disable RLS on all public tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'Disabled RLS on public.%', r.tablename;
    END LOOP;
END
$$;

-- Step 4: Drop all RLS policies in public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy % on %.%', r.policyname, r.schemaname, r.tablename;
    END LOOP;
END
$$;

-- Step 5: Verify cleanup
SELECT 
    tablename,
    rowsecurity as rls_still_enabled
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename;

SELECT COUNT(*) as remaining_policies_count
FROM pg_policies
WHERE schemaname = 'public';
```

## Method 3: Using psql Command Line (Advanced)

If you have the database connection string:

```bash
# Connect to your database
psql "postgresql://postgres:[PASSWORD]@db.qfregiogzspihbglvpqs.supabase.co:5432/postgres"

# Then run the SQL commands from Method 2
```

## After Cleanup

### Test Your Application
1. Try logging in to your app
2. Test authentication flows
3. Check if redirects work properly
4. Monitor for any access errors

### Re-enable Security (Optional)
If you need to re-enable RLS later, you can do so selectively:

```sql
-- Enable RLS on specific table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Add specific policy
CREATE POLICY "Users can view own data" ON profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
```

## Troubleshooting

### If authentication still doesn't work:
1. Check **Authentication** → **Hooks** for any custom functions
2. Check **Edge Functions** for any auth-related functions  
3. Review your application code for custom auth logic
4. Check browser network tab for error details
5. Look at Supabase logs in the dashboard

### Common Issues:
- Site URL mismatch
- Redirect URL not configured
- Custom auth hooks interfering
- Session not persisting properly

## Project Configuration Summary

**Project ID:** qfregiogzspihbglvpqs  
**Project URL:** https://qfregiogzspihbglvpqs.supabase.co  
**Expected Site URL:** https://ecucondor.com  
**Expected Redirect URLs:**
- https://ecucondor.com/auth/callback
- https://ecucondor.com/dashboard
- http://localhost:3000/auth/callback (development)

Run these cleanup steps and your authentication issues should be resolved!