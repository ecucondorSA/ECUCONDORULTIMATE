const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function finalCleanupAttempt() {
  console.log('🎯 Final Cleanup Attempt for ecucondor-app Database...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey || !supabaseUrl) {
    console.error('❌ Missing required environment variables');
    return;
  }

  console.log('🔧 Creating service role client...');
  const supabase = createClient(supabaseUrl, serviceKey);

  console.log('✅ Connected to Supabase');
  console.log(`🌐 Project URL: ${supabaseUrl}`);
  console.log(`🆔 Project ID: ${supabaseUrl.split('//')[1]?.split('.')[0]}\n`);

  try {
    // Test basic connectivity first
    console.log('🔍 Testing connectivity...');
    
    const { data: authCheck, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('ℹ️ No active session (expected for service role)');
    }
    
    // Try to access any table to test if we have database access
    console.log('🔍 Testing database access...');
    
    // Try some basic queries that should work with service role
    const testQueries = [
      {
        name: 'Test auth.users access',
        test: async () => {
          const { data, error } = await supabase.auth.admin.listUsers();
          if (!error && data) {
            console.log(`✅ Found ${data.users?.length || 0} users in auth.users`);
            return true;
          }
          return false;
        }
      },
      
      {
        name: 'Test basic table access',
        test: async () => {
          // Try to access the most basic Supabase metadata
          const { count, error } = await supabase
            .from('auth.users')
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            console.log(`✅ Can access auth tables (${count} users)`);
            return true;
          }
          return false;
        }
      }
    ];
    
    let hasAccess = false;
    for (const query of testQueries) {
      try {
        console.log(`  Testing: ${query.name}...`);
        const result = await query.test();
        if (result) {
          hasAccess = true;
          break;
        }
      } catch (error) {
        console.log(`    ⚠️ ${query.name} failed: ${error.message}`);
      }
    }
    
    if (!hasAccess) {
      console.log('❌ Cannot access database with current credentials');
      console.log('💡 Please use the manual cleanup instructions instead');
      return;
    }
    
    console.log('\n🧹 Attempting aggressive cleanup...');
    
    // Since we can't execute raw SQL, let's try to find and access actual tables
    // that might exist by trying common table names
    const commonTables = [
      'profiles', 'users', 'posts', 'comments', 'documents', 'files',
      'uploads', 'settings', 'notifications', 'sessions', 'accounts',
      'todos', 'tasks', 'projects', 'organizations', 'teams'
    ];
    
    console.log('🔍 Searching for existing tables...');
    const existingTables = [];
    
    for (const tableName of commonTables) {
      try {
        // Try to count records to see if table exists
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`  ✅ Found table: ${tableName} (${count} records)`);
          existingTables.push(tableName);
        }
      } catch (error) {
        // Table doesn't exist or we don't have access, skip silently
      }
    }
    
    if (existingTables.length === 0) {
      console.log('⚠️ No accessible tables found');
      console.log('💡 This might mean:');
      console.log('   - All tables have RLS enabled blocking service role access');
      console.log('   - Tables use different names than expected');
      console.log('   - Database is empty or newly created');
    } else {
      console.log(`\n📊 Found ${existingTables.length} accessible tables`);
      
      // For accessible tables, try to perform operations that might trigger or reveal RLS issues
      console.log('\n🔍 Testing access to found tables...');
      
      for (const tableName of existingTables.slice(0, 5)) { // Test first 5 tables
        try {
          console.log(`  Testing ${tableName}...`);
          
          // Try to select a single record
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`    ❌ Access blocked: ${error.message}`);
            if (error.message.includes('RLS') || error.message.includes('policy')) {
              console.log(`    🛡️ This indicates RLS is blocking access on ${tableName}`);
            }
          } else {
            console.log(`    ✅ Can access ${tableName} (${data?.length || 0} records returned)`);
          }
          
          // Try to insert a test record to see if policies block writes
          const testInsert = await supabase
            .from(tableName)
            .insert({ 
              test_cleanup: 'test',
              created_at: new Date().toISOString(),
              id: crypto.randomUUID ? crypto.randomUUID() : 'test-' + Date.now()
            })
            .select();
          
          if (testInsert.error) {
            if (testInsert.error.message.includes('RLS') || testInsert.error.message.includes('policy')) {
              console.log(`    🛡️ Insert blocked by RLS on ${tableName}`);
            } else {
              console.log(`    ⚠️ Insert failed: ${testInsert.error.message}`);
            }
          } else {
            console.log(`    ✅ Can insert into ${tableName}`);
            
            // Clean up test record
            await supabase
              .from(tableName)
              .delete()
              .match({ test_cleanup: 'test' });
          }
          
        } catch (error) {
          console.log(`    ❌ Error testing ${tableName}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error.message);
  }
  
  console.log('\n📋 Summary and Recommendations:');
  console.log('Since automated cleanup via service role has limitations, please:');
  console.log('');
  console.log('1. 🌐 Go to https://app.supabase.com');
  console.log('2. 🎯 Navigate to your project: qfregiogzspihbglvpqs');
  console.log('3. 📊 Go to Database → Tables');
  console.log('4. 🔓 For each table, disable Row Level Security');
  console.log('5. 🗑️ Go to Database → Policies and delete all policies');
  console.log('6. ⚙️ Go to Authentication → Settings and verify URLs:');
  console.log('   - Site URL: https://ecucondor.com');
  console.log('   - Redirect URLs: https://ecucondor.com/auth/callback');
  console.log('');
  console.log('💡 Alternative: Use the SQL Editor in Supabase Dashboard');
  console.log('   Copy the SQL from cleanup-policies.sql and run it there');
  console.log('');
  console.log('✅ After cleanup, test your app authentication immediately');
}

// Run the final attempt
finalCleanupAttempt().catch(console.error);