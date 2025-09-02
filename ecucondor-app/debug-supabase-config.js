const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugSupabaseConfig() {
  console.log('🔍 Debugging Supabase Configuration...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Environment Variables:');
  console.log(`SUPABASE_URL: ${supabaseUrl}`);
  console.log(`ANON_KEY: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log(`SERVICE_KEY: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log('');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    return;
  }
  
  // Extract project ID from URL
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
  console.log(`🆔 Project ID: ${projectId}\n`);
  
  // Create client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test basic connection
    console.log('🔌 Testing connection...');
    const { data, error } = await supabase.from('auth.users').select('count').single();
    if (error) {
      console.log('⚠️ Cannot query auth.users (expected for security), connection seems OK');
    } else {
      console.log('✅ Connection successful');
    }
    
  } catch (error) {
    console.log(`⚠️ Connection test: ${error.message}`);
  }
  
  console.log('\n🔐 Auth Configuration Investigation:');
  
  try {
    // Try to get session info
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log(`Session check: ${sessionError ? sessionError.message : 'No active session (expected)'}`);
    
    // Check auth settings through REST API
    console.log('\n🌐 Making direct API call to check auth settings...');
    
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const settings = await response.json();
      console.log('\n📊 Auth Settings from API:');
      console.log(JSON.stringify(settings, null, 2));
      
      // Look for redirect URLs specifically
      if (settings.external) {
        console.log('\n🔗 OAuth Providers Configuration:');
        Object.entries(settings.external).forEach(([provider, config]) => {
          if (config.enabled) {
            console.log(`${provider.toUpperCase()}:`);
            console.log(`  - Enabled: ${config.enabled}`);
            if (config.redirect_uri) {
              console.log(`  - Redirect URI: ${config.redirect_uri}`);
            }
            if (config.url) {
              console.log(`  - URL: ${config.url}`);
            }
          }
        });
      }
      
      // Check site URL
      if (settings.site_url) {
        console.log(`\n🌍 Site URL: ${settings.site_url}`);
      }
      
      // Check additional allowed origins
      if (settings.uri_allow_list) {
        console.log('\n📝 Allowed Origins:');
        settings.uri_allow_list.forEach((uri, index) => {
          console.log(`  ${index + 1}. ${uri}`);
        });
      }
      
    } else {
      console.log(`❌ Failed to fetch auth settings: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Error details: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error investigating auth config:', error.message);
  }
  
  console.log('\n🔧 Recommendations:');
  console.log('1. Check your Supabase Dashboard > Authentication > URL Configuration');
  console.log('2. Ensure Site URL is set to: https://ecucondor.com/dashboard');
  console.log('3. Add redirect URLs:');
  console.log('   - https://ecucondor.com/auth/callback');
  console.log('   - https://ecucondor.com/dashboard');
  console.log('   - http://localhost:3000/auth/callback (for development)');
  console.log('4. Remove any URLs ending with "/#" or just "#"');
}

// Run the debug
debugSupabaseConfig().catch(console.error);