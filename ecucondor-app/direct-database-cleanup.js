const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function directDatabaseCleanup() {
  console.log('🧹 Direct Database Cleanup for ecucondor-app...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey || !supabaseUrl) {
    console.error('❌ Missing required environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔧 Connected to Supabase with service role key\n');

  // SQL commands to clean up policies and RLS
  const cleanupCommands = [
    // First, let's see what we're working with
    {
      name: "List all tables in public schema",
      sql: `
        SELECT table_name, table_schema
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    },
    
    {
      name: "Check RLS status on all public tables",
      sql: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    },
    
    {
      name: "List all RLS policies",
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
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
      `
    }
  ];

  // Execute diagnostic queries first
  console.log('🔍 Step 1: Diagnosing current database state...\n');
  
  for (const command of cleanupCommands) {
    try {
      console.log(`📋 ${command.name}:`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: command.sql
      });
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
        // Try alternative approach using direct query
        try {
          if (command.name.includes('tables')) {
            // Try to list tables by querying a simple table
            const { data: tables, error: tablesError } = await supabase
              .from('_realtime_schema_versions')
              .select('*')
              .limit(0);
            
            if (!tablesError) {
              console.log('  ✅ Database is accessible');
            }
          }
        } catch (e) {
          console.log(`  ⚠️ Alternative query also failed`);
        }
      } else if (data) {
        if (Array.isArray(data) && data.length > 0) {
          console.log(`  ✅ Found ${data.length} results:`);
          data.forEach((row, index) => {
            if (index < 10) { // Limit output
              console.log(`    ${index + 1}. ${JSON.stringify(row)}`);
            }
          });
          if (data.length > 10) {
            console.log(`    ... and ${data.length - 10} more`);
          }
        } else {
          console.log('  ✅ Query successful, no results returned');
        }
      }
    } catch (error) {
      console.log(`  ❌ Exception: ${error.message}`);
    }
    console.log('');
  }

  // Now attempt cleanup
  console.log('🧹 Step 2: Attempting cleanup...\n');
  
  const cleanupOperations = [
    {
      name: "Disable RLS on all public tables",
      sql: `
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
      `
    },
    
    {
      name: "Drop all RLS policies in public schema",
      sql: `
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
      `
    }
  ];

  for (const operation of cleanupOperations) {
    try {
      console.log(`🔧 ${operation.name}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: operation.sql
      });
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
        
        // Try manual cleanup for common tables
        if (operation.name.includes('Disable RLS')) {
          console.log('  🔄 Attempting manual RLS disable on common tables...');
          
          const commonTables = [
            'profiles', 'users', 'posts', 'comments', 'documents', 'files', 
            'settings', 'notifications', 'uploads', 'sessions', 'accounts'
          ];
          
          for (const tableName of commonTables) {
            try {
              const { data: disableResult, error: disableError } = await supabase.rpc('exec_sql', {
                sql: `ALTER TABLE IF EXISTS public.${tableName} DISABLE ROW LEVEL SECURITY;`
              });
              
              if (!disableError) {
                console.log(`    ✅ Disabled RLS on ${tableName}`);
              }
            } catch (e) {
              // Table might not exist
            }
          }
        }
        
        if (operation.name.includes('Drop all RLS policies')) {
          console.log('  🔄 Attempting to identify and drop specific policies...');
          
          // Try to get policy names directly
          try {
            const { data: policies } = await supabase.rpc('exec_sql', {
              sql: "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LIMIT 20;"
            });
            
            if (policies && policies.length > 0) {
              console.log(`    Found ${policies.length} policies to drop:`);
              for (const policy of policies) {
                try {
                  await supabase.rpc('exec_sql', {
                    sql: `DROP POLICY IF EXISTS ${policy.policyname} ON public.${policy.tablename};`
                  });
                  console.log(`    ✅ Dropped ${policy.policyname} on ${policy.tablename}`);
                } catch (e) {
                  console.log(`    ⚠️ Could not drop ${policy.policyname}: ${e.message}`);
                }
              }
            }
          } catch (e) {
            console.log(`    ⚠️ Could not list policies: ${e.message}`);
          }
        }
        
      } else {
        console.log(`  ✅ ${operation.name} completed successfully`);
        if (data && Array.isArray(data)) {
          console.log(`    Affected ${data.length} items`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Exception: ${error.message}`);
    }
    console.log('');
  }

  // Final verification
  console.log('🔍 Step 3: Verification...\n');
  
  try {
    console.log('📋 Final check - RLS status after cleanup:');
    
    const { data: finalCheck, error: finalError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });
    
    if (!finalError && finalCheck) {
      finalCheck.forEach(table => {
        console.log(`  ${table.tablename}: ${table.rls_enabled ? '🔒 RLS ENABLED' : '🔓 RLS DISABLED'}`);
      });
    }
    
    console.log('\n📋 Final check - remaining policies:');
    const { data: remainingPolicies } = await supabase.rpc('exec_sql', {
      sql: "SELECT COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public';"
    });
    
    if (remainingPolicies && remainingPolicies.length > 0) {
      const count = remainingPolicies[0].policy_count;
      console.log(`  Remaining policies in public schema: ${count}`);
    }
    
  } catch (error) {
    console.log(`  ⚠️ Verification failed: ${error.message}`);
  }

  console.log('\n✅ Database cleanup process completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Test your authentication flow');
  console.log('2. Check your app functionality');
  console.log('3. Re-enable RLS selectively if needed');
  console.log('4. Monitor for any access issues');
  
  console.log('\n🔧 If you need to re-enable RLS later:');
  console.log('   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;');
  console.log('\n🛡️ To add back specific policies, use:');
  console.log('   CREATE POLICY policy_name ON table_name FOR SELECT TO authenticated USING (user_id = auth.uid());');
}

// Run the cleanup
directDatabaseCleanup().catch(console.error);