const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function cleanDatabasePolicies() {
  console.log('🧹 Cleaning Database Policies and RLS Rules...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey || !supabaseUrl) {
    console.error('❌ Missing required environment variables');
    console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('SERVICE_KEY:', serviceKey ? 'Set' : 'Missing');
    return;
  }

  // Create admin client
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔧 Using service role to access database...\n');

  try {
    console.log('🔍 Step 1: Checking database connection...');
    
    // Test connection by trying to access a system table
    const { data: testConnection, error: connectionError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Database connection successful\n');

    // Step 2: List all tables
    console.log('🔍 Step 2: Listing all tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_type', 'BASE TABLE')
      .in('table_schema', ['public', 'auth']);
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
    } else {
      console.log('📋 Tables found:');
      const publicTables = tables.filter(t => t.table_schema === 'public');
      const authTables = tables.filter(t => t.table_schema === 'auth');
      
      if (publicTables.length > 0) {
        console.log('  Public schema:');
        publicTables.forEach((table, index) => {
          console.log(`    ${index + 1}. ${table.table_name}`);
        });
      }
      
      if (authTables.length > 0) {
        console.log('  Auth schema:');
        authTables.forEach((table, index) => {
          console.log(`    ${index + 1}. ${table.table_name}`);
        });
      }
    }

    // Step 3: Check RLS policies using direct SQL
    console.log('\n🔍 Step 3: Checking RLS policies...');
    
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
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
        WHERE schemaname IN ('public', 'auth')
        ORDER BY schemaname, tablename, policyname;
      `
    });

    if (policiesError) {
      console.log('⚠️ Cannot directly query pg_policies, trying alternative approach...');
      
      // Alternative: try to get policies through information schema
      const { data: altPolicies, error: altError } = await supabase
        .from('information_schema.enabled_roles')
        .select('*')
        .limit(1);
      
      if (altError) {
        console.log('⚠️ Limited access to policy information');
      }
    } else if (policies && policies.length > 0) {
      console.log(`📜 Found ${policies.length} RLS policies:`);
      policies.forEach((policy, index) => {
        console.log(`\n  ${index + 1}. Policy: ${policy.policyname}`);
        console.log(`     Schema: ${policy.schemaname}`);
        console.log(`     Table: ${policy.tablename}`);
        console.log(`     Command: ${policy.cmd}`);
        console.log(`     Roles: ${policy.roles}`);
        if (policy.qual) {
          console.log(`     Expression: ${policy.qual}`);
        }
        if (policy.with_check) {
          console.log(`     Check: ${policy.with_check}`);
        }
      });
    } else {
      console.log('✅ No RLS policies found in public/auth schemas');
    }

    // Step 4: Check RLS status on tables
    console.log('\n🔍 Step 4: Checking RLS status on tables...');
    
    if (tables && tables.length > 0) {
      for (const table of tables.filter(t => t.table_schema === 'public')) {
        try {
          const { data: rlsCheck, error: rlsError } = await supabase.rpc('exec_sql', {
            sql: `SELECT relrowsecurity as rls_enabled FROM pg_class WHERE relname = '${table.table_name}' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');`
          });
          
          if (!rlsError && rlsCheck && rlsCheck.length > 0) {
            const rlsEnabled = rlsCheck[0].rls_enabled;
            console.log(`  ${table.table_name}: ${rlsEnabled ? '🔒 RLS ENABLED' : '🔓 RLS DISABLED'}`);
          }
        } catch (e) {
          console.log(`  ${table.table_name}: Cannot check RLS status`);
        }
      }
    }

    // Step 5: Provide cleanup commands
    console.log('\n🧹 Step 5: Cleanup Commands Available:');
    console.log('\nTo disable RLS on all tables:');
    if (tables) {
      tables.filter(t => t.table_schema === 'public').forEach(table => {
        console.log(`  ALTER TABLE public.${table.table_name} DISABLE ROW LEVEL SECURITY;`);
      });
    }

    console.log('\nTo drop all policies (if any exist):');
    console.log('  -- Run this first to list all policies:');
    console.log('  SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = \'public\';');
    console.log('  -- Then drop each policy with:');
    console.log('  -- DROP POLICY policy_name ON table_name;');

    console.log('\n✅ Database investigation complete!');
    console.log('\n💡 Recommendations:');
    console.log('1. If you want to completely reset RLS, run the ALTER TABLE commands above');
    console.log('2. Review any custom auth logic in your application code');
    console.log('3. Check Supabase Dashboard for any Auth Hooks or Edge Functions');
    console.log('4. Test authentication flow after making changes');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\nTrying to execute cleanup directly...');
    
    // Try to execute cleanup SQL directly
    try {
      console.log('\n🧹 Attempting to disable RLS on common tables...');
      
      const commonTables = ['profiles', 'users', 'sessions', 'posts', 'documents', 'files'];
      
      for (const tableName of commonTables) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE IF EXISTS public.${tableName} DISABLE ROW LEVEL SECURITY;`
          });
          
          if (!error) {
            console.log(`✅ Disabled RLS on ${tableName}`);
          }
        } catch (e) {
          // Table might not exist, that's ok
        }
      }
      
      console.log('\n🧹 Attempting to drop common restrictive policies...');
      const { data: dropResult, error: dropError } = await supabase.rpc('exec_sql', {
        sql: `
          -- This will attempt to drop any policies that might exist
          DO $$
          DECLARE
            r RECORD;
          BEGIN
            FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
            LOOP
              EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
              RAISE NOTICE 'Dropped policy % on %.%', r.policyname, r.schemaname, r.tablename;
            END LOOP;
          END
          $$;
        `
      });
      
      if (!dropError) {
        console.log('✅ Policy cleanup completed');
      }
      
    } catch (cleanupError) {
      console.log('⚠️ Cleanup requires manual intervention via Supabase Dashboard');
    }
  }
}

// Run the cleanup
cleanDatabasePolicies().catch(console.error);