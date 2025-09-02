const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugAuthDetailed() {
  console.log('🔍 Detailed Auth Configuration Investigation...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing service role key for detailed investigation');
    return;
  }
  
  // Create admin client
  const supabase = createClient(supabaseUrl, serviceKey);
  
  console.log('🔧 Attempting to get auth configuration with service role...\n');
  
  try {
    // Try different endpoints
    const endpoints = [
      '/auth/v1/settings',
      '/auth/v1/config',
      '/rest/v1/auth.providers',
      '/rest/v1/auth.config'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🔍 Trying endpoint: ${endpoint}`);
      
      try {
        const response = await fetch(`${supabaseUrl}${endpoint}`, {
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   Response:`, JSON.stringify(data, null, 2));
        } else {
          const errorText = await response.text();
          console.log(`   Error: ${errorText.substring(0, 200)}...`);
        }
        
      } catch (error) {
        console.log(`   Exception: ${error.message}`);
      }
      
      console.log('');
    }
    
    // Try to check if we can access the database directly
    console.log('🗃️ Attempting database query for auth configuration...');
    
    try {
      // Try to query auth schema tables (this might not work due to RLS)
      const { data, error } = await supabase
        .from('auth.config')
        .select('*');
        
      if (error) {
        console.log(`   Auth config query error: ${error.message}`);
      } else {
        console.log(`   Auth config data:`, data);
      }
    } catch (error) {
      console.log(`   Database query error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error in detailed investigation:', error);
  }
  
  console.log('\n📝 Manual Investigation Steps:');
  console.log('Since API access to auth config might be restricted, please:');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/projects');
  console.log(`2. Select project: qfregiogzspihbglvpqs`);
  console.log('3. Navigate to: Authentication → URL Configuration');
  console.log('4. Check these settings:');
  console.log('   - Site URL');
  console.log('   - Redirect URLs');
  console.log('   - Additional Redirect URLs');
  console.log('');
  console.log('🎯 Look specifically for any URL that is:');
  console.log('   - "https://ecucondor.com" (without path)');
  console.log('   - "https://ecucondor.com/#"');
  console.log('   - Any URL ending with just "#"');
  console.log('');
  console.log('✅ Replace them with:');
  console.log('   - https://ecucondor.com/dashboard (as Site URL)');
  console.log('   - https://ecucondor.com/auth/callback (as Redirect URL)');
}

// Run the detailed debug
debugAuthDetailed().catch(console.error);