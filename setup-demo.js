#!/usr/bin/env node

/**
 * Samanin Frontend Setup & Demo Script
 * 
 * This script helps set up and demonstrate the ? User Registration functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Samanin Frontend - ? Setup & Demo\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the frontend directory.');
  process.exit(1);
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error(`❌ Error: Node.js ${majorVersion} detected. Please use Node.js 18 or higher.`);
  process.exit(1);
}

console.log(`✅ Node.js ${nodeVersion} detected`);

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚙️ Creating .env.local file...');
  fs.writeFileSync(envPath, 'NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api\n');
  console.log('✅ .env.local created\n');
}

// Display setup information
console.log('🎯 ? Implementation Features:');
console.log('   ✅ User Registration Form');
console.log('   ✅ Bilingual Support (Persian/Arabic)');
console.log('   ✅ RTL Layout Support');
console.log('   ✅ Real-time Form Validation');
console.log('   ✅ Password Strength Indicator');
console.log('   ✅ Responsive Design');
console.log('   ✅ Accessibility (WCAG)');
console.log('   ✅ API Integration');
console.log('   ✅ Error Handling\n');

console.log('🌍 Supported Languages:');
console.log('   🇮🇷 Persian (فارسی) - Default');
console.log('   🇦🇪 Arabic (عربي)\n');

console.log('📋 API Integration:');
console.log('   📍 Backend URL: http://localhost:3000/api');
console.log('   🔗 Registration Endpoint: POST /auth/register');
console.log('   📄 Following ? API Contract\n');

console.log('🚀 To start the development server:');
console.log('   npm run dev\n');

console.log('🌐 Then open:');
console.log('   http://localhost:3001\n');

console.log('🔧 Available Scripts:');
console.log('   npm run dev     - Start development server');
console.log('   npm run build   - Build for production');
console.log('   npm run start   - Start production server');
console.log('   npm run lint    - Run ESLint');
console.log('   npm run type-check - TypeScript type checking\n');

console.log('📚 Testing the Registration Flow:');
console.log('1. 🌍 Test language switching (Persian ↔ Arabic)');
console.log('2. 📝 Fill out the registration form');
console.log('3. 🔒 Test password strength indicator');
console.log('4. ✅ Submit form and check API integration');
console.log('5. 🎨 Test responsive design on different screen sizes\n');

console.log('📋 Form Fields (Per ? Requirements):');
console.log('   • Full Name (2-100 chars)');
console.log('   • Email Address (unique, valid format)');
console.log('   • Password (8+ chars, mixed case, numbers, symbols)');
console.log('   • Confirm Password (must match)');
console.log('   • Company/Business Name (2-200 chars)');
console.log('   • Language Selection (Persian/Arabic)');
console.log('   • Locale Selection (Iran/UAE)\n');

console.log('🎯 Business Rules Implemented:');
console.log('   BR01: ✅ Email uniqueness validation');
console.log('   BR02: ✅ Automatic tenant creation (backend)');
console.log('   BR03: ✅ Tenant Owner role assignment (backend)');
console.log('   BR04: ✅ Company name requirement');
console.log('   BR05: ✅ Language/locale selection');
console.log('   BR06: ✅ Password security requirements');
console.log('   BR07: ✅ No auto-login after registration\n');

console.log('🔍 Error Scenarios to Test:');
console.log('   • Email already exists (409)');
console.log('   • Password policy violations');
console.log('   • Password confirmation mismatch');
console.log('   • Missing required fields');
console.log('   • Network/server errors\n');

console.log('✨ Ready to start! Run "npm run dev" to begin.\n');

// Optionally start the dev server
const args = process.argv.slice(2);
if (args.includes('--start') || args.includes('-s')) {
  console.log('🚀 Starting development server...\n');
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to start development server:', error.message);
    process.exit(1);
  }
}
