const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugDatabasePolicies() {
  console.log('🔍 Investigating Database Policies and RLS Rules...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    console.error('❌ Need service role key to investigate policies');
    return;
  }
  
  // Create admin client
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('🔧 Using service role to investigate database...\n');
  
  try {
    // 1. List all tables first
    console.log('🔍 1. Listing all tables in public schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
    } else {
      console.log('📋 Tables found:');
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.table_name}`);
      });
    }
    
    if (!functionsError && functions) {
      console.log('Custom functions found:', functions);
    }
    
    // Alternative way to check functions
    try {
      const { data: pgFunctions, error: pgError } = await supabase
        .from('pg_proc')
        .select('proname, prosrc')
        .ilike('proname', '%auth%')
        .or('proname.ilike.%login%,proname.ilike.%redirect%,proname.ilike.%session%');
      
      if (!pgError && pgFunctions?.length > 0) {
        console.log('📋 Custom auth-related functions:');
        pgFunctions.forEach(func => {
          console.log(`  - ${func.proname}`);
          if (func.prosrc?.includes('redirect') || func.prosrc?.includes('ecucondor.com')) {
            console.log('    ⚠️ Contains redirect logic!');
            console.log(`    Source: ${func.prosrc.substring(0, 200)}...`);
          }
        });
      }
    } catch (e) {
      console.log('   Cannot access pg_proc (expected)');
    }
    
    // 2. Check for triggers on auth tables
    console.log('\n🔍 2. Checking for triggers...');
    try {
      const { data: triggers, error: triggersError } = await supabase
        .from('information_schema.triggers')
        .select('*')
        .or('event_object_table.eq.users,event_object_table.eq.sessions,event_object_table.ilike.%auth%');
        
      if (!triggersError && triggers?.length > 0) {
        console.log('📋 Triggers found:');
        triggers.forEach(trigger => {
          console.log(`  - ${trigger.trigger_name} on ${trigger.event_object_table}`);
          console.log(`    Event: ${trigger.event_manipulation}`);
        });
      } else {
        console.log('   No custom triggers found on auth tables');
      }
    } catch (e) {
      console.log('   Cannot access triggers info:', e.message);
    }
    
    // 3. Check RLS policies
    console.log('\n🔍 3. Checking RLS policies...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .or('tablename.eq.users,tablename.eq.sessions,tablename.ilike.%auth%,tablename.eq.profiles');
        
      if (!policiesError && policies?.length > 0) {
        console.log('📋 RLS Policies found:');
        policies.forEach(policy => {
          console.log(`  - ${policy.policyname} on ${policy.tablename}`);
          console.log(`    Type: ${policy.cmd} | Role: ${policy.roles}`);
          if (policy.qual) {
            console.log(`    Condition: ${policy.qual}`);
          }
          
          // Check if policy contains redirect logic
          if (policy.qual?.includes('redirect') || policy.with_check?.includes('redirect')) {
            console.log('    ⚠️ Policy contains redirect logic!');
          }
        });
      }
    } catch (e) {
      console.log('   Cannot access policies:', e.message);
    }
    
    // 4. Check for profiles table and its triggers
    console.log('\n🔍 4. Checking profiles table...');
    try {
      const { data: profilesSchema, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_name', 'profiles');
        
      if (!schemaError && profilesSchema?.length > 0) {
        console.log('📋 Profiles table columns:');
        profilesSchema.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
        
        // Check if there's any redirect-related column
        const redirectColumns = profilesSchema.filter(col => 
          col.column_name.toLowerCase().includes('redirect') ||
          col.column_name.toLowerCase().includes('url') ||
          col.column_name.toLowerCase().includes('dashboard')
        );
        
        if (redirectColumns.length > 0) {
          console.log('⚠️ Found potential redirect-related columns:');
          redirectColumns.forEach(col => {
            console.log(`  - ${col.column_name}`);
          });
        }
      }
    } catch (e) {
      console.log('   Cannot access profiles schema:', e.message);
    }
    
    // 5. Check auth.users directly for any custom fields
    console.log('\n🔍 5. Checking auth.users structure...');
    try {
      // This might not work due to RLS, but let's try
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers?.users?.length > 0) {
        const user = authUsers.users[0];
        console.log('📋 Sample user structure:');
        console.log('  - user_metadata keys:', Object.keys(user.user_metadata || {}));
        console.log('  - app_metadata keys:', Object.keys(user.app_metadata || {}));
        
        // Check for redirect URLs in metadata
        const allMetadata = { ...user.user_metadata, ...user.app_metadata };
        Object.entries(allMetadata).forEach(([key, value]) => {
          if (key.toLowerCase().includes('redirect') || 
              key.toLowerCase().includes('url') ||
              (typeof value === 'string' && value.includes('ecucondor.com'))) {
            console.log(`  ⚠️ Found redirect-related metadata: ${key} = ${value}`);
          }
        });
      }
    } catch (e) {
      console.log('   Cannot access auth.users:', e.message);
    }
    
    // 6. Check for webhooks or edge functions
    console.log('\n🔍 6. Looking for potential webhook configurations...');
    
    // Check if there are any files in the project that might indicate webhooks
    const webhookIndicators = [
      'webhook',
      'edge-function',
      'on_auth_user_confirmed',
      'on_user_created'
    ];
    
    console.log('   Check for these in your Supabase project:');
    console.log('   - Database Webhooks (Dashboard > Database > Webhooks)');
    console.log('   - Edge Functions (Dashboard > Edge Functions)');
    console.log('   - Auth Hooks (Dashboard > Authentication > Hooks)');
    
  } catch (error) {
    console.error('❌ Error investigating database:', error);
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Check Supabase Dashboard > Authentication > Hooks');
  console.log('2. Check Dashboard > Database > Webhooks');
  console.log('3. Check Dashboard > Edge Functions');
  console.log('4. Look for any custom auth handling code in your codebase');
}

// Run the investigation
debugDatabasePolicies().catch(console.error);