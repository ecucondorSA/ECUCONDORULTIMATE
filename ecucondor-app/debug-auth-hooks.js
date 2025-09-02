const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugAuthHooks() {
  console.log('🔍 Investigating Auth Hooks and Edge Functions...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Create admin client
  const supabase = createClient(supabaseUrl, serviceKey);
  
  try {
    // Check for any profiles table that might handle redirects
    console.log('🔍 1. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (!profilesError && profiles) {
      console.log('✅ Profiles table exists');
      if (profiles.length > 0) {
        console.log('📋 Sample profile structure:', Object.keys(profiles[0]));
        
        // Look for any redirect-related fields
        Object.entries(profiles[0]).forEach(([key, value]) => {
          if (key.toLowerCase().includes('redirect') || 
              key.toLowerCase().includes('url') ||
              key.toLowerCase().includes('dashboard') ||
              (typeof value === 'string' && value.includes('ecucondor.com'))) {
            console.log(`  ⚠️ Redirect-related field: ${key} = ${value}`);
          }
        });
      }
    } else if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    }
    
    // Check for user preferences or settings table
    console.log('\n🔍 2. Checking for user settings/preferences...');
    const settingsTables = ['user_settings', 'user_preferences', 'settings', 'preferences'];
    
    for (const tableName of settingsTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Found table: ${tableName}`);
          if (data && data.length > 0) {
            console.log(`   Keys: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (e) {
        // Table doesn't exist, skip
      }
    }
    
    // Try to make a test auth call and see the response
    console.log('\n🔍 3. Testing auth flow...');
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('Auth session test:', authError ? authError.message : 'No active session');
    } catch (e) {
      console.log('Auth test error:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n📝 Manual Investigation Required:');
  console.log('');
  console.log('🎯 Check these locations in Supabase Dashboard:');
  console.log('');
  console.log('1. 🪝 Authentication > Hooks:');
  console.log('   - Look for custom auth hooks that might redirect');
  console.log('   - Check "MFA verification attempted" hooks');
  console.log('   - Check "Password recovery requested" hooks');
  console.log('');
  console.log('2. ⚡ Edge Functions:');
  console.log('   - Look for functions triggered on auth events');
  console.log('   - Check for any function handling redirects');
  console.log('');
  console.log('3. 🔗 Database > Webhooks:');
  console.log('   - Look for webhooks on auth.users table');
  console.log('   - Check webhook URLs for redirect logic');
  console.log('');
  console.log('4. 🔐 Authentication > Providers > Google:');
  console.log('   - Check if there are custom scopes or additional config');
  console.log('');
  console.log('5. 📊 Database > Extensions:');
  console.log('   - Look for auth-related extensions that might affect flow');
  console.log('');
  console.log('🔍 Also check your codebase for:');
  console.log('   - Any middleware that processes auth redirects');
  console.log('   - Custom auth event handlers');
  console.log('   - Route handlers that might force redirects');
}

// Run the investigation
debugAuthHooks().catch(console.error);