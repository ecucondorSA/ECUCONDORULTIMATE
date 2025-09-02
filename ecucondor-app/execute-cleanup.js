const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function executeCleanup() {
  console.log('🧹 Executing Database Cleanup for ecucondor-app...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey || !supabaseUrl) {
    console.error('❌ Missing required environment variables');
    return;
  }

  console.log('🔧 Creating admin client with service role...');
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✅ Connected to Supabase\n');

  // Manual cleanup approach since exec_sql is not available
  const cleanupSteps = [
    {
      name: "List all tables in public schema",
      query: async () => {
        console.log('📋 Attempting to identify tables...');
        
        // Try different approaches to list tables
        const attempts = [
          // Attempt 1: Try to query a system view via REST API
          async () => {
            const response = await fetch(`${supabaseUrl}/rest/v1/pg_tables?schemaname=eq.public&select=tablename,rowsecurity`, {
              headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              return { success: true, data, source: 'REST API pg_tables' };
            }
            return { success: false, error: `HTTP ${response.status}` };
          },
          
          // Attempt 2: Try information_schema via REST
          async () => {
            const response = await fetch(`${supabaseUrl}/rest/v1/information_schema.tables?table_schema=eq.public&table_type=eq.BASE%20TABLE&select=table_name`, {
              headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              return { success: true, data, source: 'information_schema.tables' };
            }
            return { success: false, error: `HTTP ${response.status}` };
          }
        ];
        
        for (const attempt of attempts) {
          try {
            const result = await attempt();
            if (result.success) {
              console.log(`✅ Found tables via ${result.source}:`);
              result.data.forEach((table, index) => {
                const tableName = table.tablename || table.table_name;
                const rlsStatus = table.rowsecurity !== undefined ? (table.rowsecurity ? '🔒' : '🔓') : '';
                console.log(`  ${index + 1}. ${tableName} ${rlsStatus}`);
              });
              return result.data.map(t => t.tablename || t.table_name);
            }
          } catch (error) {
            console.log(`  ⚠️ Attempt failed: ${error.message}`);
          }
        }
        
        // Fallback: assume common table names
        console.log('⚠️ Could not automatically detect tables, using common names...');
        return ['profiles', 'posts', 'comments', 'files', 'documents', 'settings', 'notifications'];
      }
    },
    
    {
      name: "Check and list RLS policies",
      query: async () => {
        console.log('🛡️ Attempting to list RLS policies...');
        
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/pg_policies?schemaname=eq.public&select=tablename,policyname,cmd,roles`, {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const policies = await response.json();
            if (policies.length > 0) {
              console.log(`✅ Found ${policies.length} RLS policies:`);
              policies.forEach((policy, index) => {
                console.log(`  ${index + 1}. ${policy.policyname} on ${policy.tablename} (${policy.cmd})`);
              });
              return policies;
            } else {
              console.log('✅ No RLS policies found in public schema');
              return [];
            }
          } else {
            console.log(`⚠️ Could not fetch policies: HTTP ${response.status}`);
            return [];
          }
        } catch (error) {
          console.log(`⚠️ Error checking policies: ${error.message}`);
          return [];
        }
      }
    },

    {
      name: "Disable RLS and drop policies",
      query: async (tables) => {
        console.log('🧹 Starting cleanup process...\n');
        
        // Step 1: Disable RLS on each table
        console.log('🔓 Disabling RLS on tables...');
        const disablePromises = tables.map(async (tableName) => {
          try {
            // Try using SQL via REST API
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sql: `ALTER TABLE IF EXISTS public."${tableName}" DISABLE ROW LEVEL SECURITY;`
              })
            });
            
            if (response.ok) {
              console.log(`  ✅ Disabled RLS on ${tableName}`);
              return { table: tableName, success: true };
            } else {
              console.log(`  ⚠️ Could not disable RLS on ${tableName}: HTTP ${response.status}`);
              return { table: tableName, success: false, error: `HTTP ${response.status}` };
            }
          } catch (error) {
            console.log(`  ❌ Error disabling RLS on ${tableName}: ${error.message}`);
            return { table: tableName, success: false, error: error.message };
          }
        });
        
        const disableResults = await Promise.all(disablePromises);
        const successCount = disableResults.filter(r => r.success).length;
        console.log(`📊 RLS disable results: ${successCount}/${tables.length} successful\n`);
        
        // Step 2: Attempt to drop policies
        console.log('🗑️ Attempting to drop all policies via batch operation...');
        
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sql: `
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
            })
          });
          
          if (response.ok) {
            console.log('  ✅ Successfully dropped all policies via batch operation');
          } else {
            console.log(`  ⚠️ Batch policy drop failed: HTTP ${response.status}`);
          }
        } catch (error) {
          console.log(`  ⚠️ Batch policy drop error: ${error.message}`);
        }
      }
    }
  ];

  try {
    let tables = [];
    
    // Execute cleanup steps
    for (const step of cleanupSteps) {
      console.log(`\n🔄 ${step.name}...`);
      
      if (step.name.includes('List all tables')) {
        tables = await step.query();
      } else if (step.name.includes('Check and list RLS policies')) {
        await step.query();
      } else if (step.name.includes('Disable RLS')) {
        await step.query(tables);
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/pg_policies?schemaname=eq.public&select=count`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Accept': 'application/json',
          'Prefer': 'count=exact'
        }
      });
      
      if (response.ok) {
        const countHeader = response.headers.get('content-range');
        const count = countHeader ? countHeader.split('/')[1] : 'unknown';
        console.log(`📊 Remaining policies in public schema: ${count}`);
      }
    } catch (error) {
      console.log('⚠️ Could not verify final policy count');
    }

    console.log('\n🎉 Cleanup process completed!');
    console.log('\n💡 What was done:');
    console.log('- Attempted to disable RLS on all detected tables');
    console.log('- Attempted to drop all RLS policies in public schema');
    console.log('\n🔧 Next steps:');
    console.log('1. Test your authentication flow in the app');
    console.log('2. Check if login/logout works properly');
    console.log('3. Monitor the application for any access issues');
    console.log('4. If everything works, you can selectively re-enable RLS later');

  } catch (error) {
    console.error('❌ Cleanup process failed:', error.message);
  }
}

// Run the cleanup
executeCleanup().catch(console.error);