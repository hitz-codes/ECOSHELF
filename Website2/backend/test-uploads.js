const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Upload Directory Structure...\n');

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');

console.log('Upload Directories:');
console.log(`📁 uploads: ${fs.existsSync(uploadsDir) ? '✅ EXISTS' : '❌ MISSING'}`);
console.log(`📁 uploads/products: ${fs.existsSync(productsDir) ? '✅ EXISTS' : '❌ MISSING'}`);

if (fs.existsSync(productsDir)) {
  try {
    const files = fs.readdirSync(productsDir);
    console.log(`\n📸 Product Images (${files.length} files):`);
    
    if (files.length === 0) {
      console.log('   No images found in uploads/products/');
    } else {
      files.forEach((file, index) => {
        const filePath = path.join(productsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`);
      });
    }
  } catch (error) {
    console.log(`❌ Error reading directory: ${error.message}`);
  }
}

console.log('\n🌐 URL Structure:');
console.log('Backend serves static files from: /uploads');
console.log('Product images should be accessible at: http://localhost:5000/uploads/products/filename.jpg');
console.log('Frontend should construct URLs as: API_BASE_URL.replace("/api", "") + product.image_url');

console.log('\n💡 Troubleshooting Tips:');
console.log('1. Make sure backend is running on port 5000');
console.log('2. Check if uploads/products directory has proper permissions');
console.log('3. Verify static file serving is working: app.use("/uploads", express.static("uploads"))');
console.log('4. Test direct image access in browser: http://10.100.8.238:5000/uploads/products/filename.jpg');