#!/usr/bin/env node

/**
 * Security verification script for Ecucondor App
 * Verifies that sensitive data is not exposed in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔒 Ecucondor Security Check\n');

// Check if .env.local is in .gitignore
const gitignorePath = path.join(__dirname, '../.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env') || gitignoreContent.includes('.env*')) {
    console.log('✅ .env files are properly ignored by git');
  } else {
    console.log('❌ WARNING: .env files are NOT ignored by git');
    process.exit(1);
  }
} else {
  console.log('❌ .gitignore file not found');
  process.exit(1);
}

// Check if .env.example exists
const envExamplePath = path.join(__dirname, '../.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example exists for documentation');
} else {
  console.log('⚠️  .env.example not found - consider creating one');
}

// Check for hardcoded secrets in source code
const srcPath = path.join(__dirname, '../src');
const searchPatterns = [
  /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, // JWT tokens
  /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
  /AKIA[0-9A-Z]{16}/g, // AWS Access Keys
];

function searchDirectory(dir, patterns) {
  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results.push(...searchDirectory(fullPath, patterns));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          results.push({
            file: fullPath,
            matches: matches
          });
        }
      }
    }
  }

  return results;
}

const suspiciousContent = searchDirectory(srcPath, searchPatterns);

if (suspiciousContent.length === 0) {
  console.log('✅ No suspicious secrets found in source code');
} else {
  console.log('❌ WARNING: Potential secrets found in source code:');
  suspiciousContent.forEach(result => {
    console.log(`  File: ${result.file}`);
    console.log(`  Potential secrets: ${result.matches.length}`);
  });
  process.exit(1);
}

// Check if SECURITY.md exists
const securityMdPath = path.join(__dirname, '../SECURITY.md');
if (fs.existsSync(securityMdPath)) {
  console.log('✅ SECURITY.md documentation exists');
} else {
  console.log('⚠️  SECURITY.md not found - consider creating security documentation');
}

console.log('\n🎉 Security check completed successfully!');
console.log('📋 Remember to:');
console.log('   - Keep your Supabase keys secure');
console.log('   - Regenerate keys if compromised');
console.log('   - Use different keys for dev/prod environments');
console.log('   - Enable Row Level Security in Supabase');