-- Database cleanup script for ecucondor-app
-- This script will identify and clean up RLS policies that might be causing authentication issues

\echo '🔍 Step 1: Listing all tables in public schema'
SELECT 
    table_name,
    table_schema
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '🔒 Step 2: Checking RLS status on all public tables'
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '🛡️ Step 3: Listing all RLS policies in public schema'
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

\echo ''
\echo '🧹 Step 4: Disabling RLS on all public tables'

-- Disable RLS on all public tables
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

\echo ''
\echo '🗑️ Step 5: Dropping all RLS policies in public schema'

-- Drop all RLS policies in public schema
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

\echo ''
\echo '✅ Step 6: Final verification - RLS status after cleanup'
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '📊 Final policy count'
SELECT COUNT(*) as remaining_policies_count
FROM pg_policies
WHERE schemaname = 'public';

\echo ''
\echo '🎉 Database cleanup completed!'
\echo 'All RLS policies have been removed and RLS has been disabled on all public tables.'
\echo ''
\echo '💡 Next steps:'
\echo '1. Test your authentication flow'
\echo '2. Check your application functionality'
\echo '3. Monitor for any access issues'
\echo ''
\echo '🔧 To re-enable RLS on a specific table later:'
\echo '   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;'
\echo ''
\echo '🛡️ To add back specific policies:'
\echo '   CREATE POLICY policy_name ON table_name FOR SELECT TO authenticated USING (condition);'