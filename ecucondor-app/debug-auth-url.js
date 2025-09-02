// Debug script to identify where the %0A (newline) is coming from
require('dotenv').config({ path: '.env.local' });

// Test environment variables
console.log('🔍 Environment Variables Analysis:');
console.log('');

const vars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_APP_URL', 
  'NEXT_PUBLIC_BASE_URL',
  'NODE_ENV',
  'VERCEL_ENV'
];

vars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}:`);
  console.log(`  Value: "${value}"`);
  console.log(`  Length: ${value?.length || 0}`);
  console.log(`  Has newline: ${value?.includes('\n') ? '❌ YES' : '✅ NO'}`);
  console.log(`  Has carriage return: ${value?.includes('\r') ? '❌ YES' : '✅ NO'}`);
  console.log(`  Encoded: ${value ? encodeURIComponent(value) : 'undefined'}`);
  console.log('');
});

// Test URL construction
console.log('🔧 URL Construction Test:');
console.log('');

// Simulate what the browser code does
const testUrls = [
  // Test with localhost
  'http://localhost:3002/auth/callback',
  // Test with production domain
  'https://ecucondor.com/auth/callback',
  // Test with environment variable
  process.env.NEXT_PUBLIC_APP_URL + '/auth/callback',
  process.env.NEXT_PUBLIC_BASE_URL + '/auth/callback'
];

testUrls.forEach((url, index) => {
  console.log(`Test URL ${index + 1}:`);
  console.log(`  Raw: "${url}"`);
  console.log(`  Encoded: ${encodeURIComponent(url)}`);
  console.log(`  Has newline: ${url?.includes('\n') ? '❌ YES' : '✅ NO'}`);
  console.log('');
});

// Test the actual function logic
console.log('🎯 Function Logic Test:');
console.log('');

const getRedirectUrlOld = () => {
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` || 'FALLBACK';
  }
  return 'http://localhost:3002/auth/callback';
};

const getRedirectUrlNew = () => {
  // This simulates browser hostname check, but we can't do that in Node
  // Just test the production branch
  return 'https://ecucondor.com/auth/callback';
};

console.log('Old function would return:');
const oldUrl = getRedirectUrlOld();
console.log(`  "${oldUrl}"`);
console.log(`  Encoded: ${encodeURIComponent(oldUrl)}`);
console.log(`  Has newline: ${oldUrl?.includes('\n') ? '❌ YES' : '✅ NO'}`);
console.log('');

console.log('New function would return:');
const newUrl = getRedirectUrlNew();
console.log(`  "${newUrl}"`);
console.log(`  Encoded: ${encodeURIComponent(newUrl)}`);
console.log(`  Has newline: ${newUrl?.includes('\n') ? '❌ YES' : '✅ NO'}`);
console.log('');

console.log('🔍 Problem Analysis:');
console.log('');

if (process.env.NEXT_PUBLIC_APP_URL?.includes('\n')) {
  console.log('❌ FOUND THE PROBLEM: NEXT_PUBLIC_APP_URL contains newline!');
} else if (process.env.NEXT_PUBLIC_BASE_URL?.includes('\n')) {
  console.log('❌ FOUND THE PROBLEM: NEXT_PUBLIC_BASE_URL contains newline!');
} else {
  console.log('✅ Environment variables look clean');
  console.log('⚠️ The problem might be:');
  console.log('  1. Browser cache using old code');
  console.log('  2. Code not deployed yet'); 
  console.log('  3. Different environment variables on production');
  console.log('  4. Some other code path creating the URL');
}