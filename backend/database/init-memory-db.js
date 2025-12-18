const MemoryDatabase = require('./memory-db');

console.log('🚀 Initializing EcoMart Memory Database...');
console.log('=====================================');

try {
  const db = new MemoryDatabase();
  db.initializeSampleData();
  
  const stats = db.getStats();
  console.log('\n📊 Database Statistics:');
  console.log(`   👥 Total Users: ${stats.users}`);
  console.log(`   📦 Total Products: ${stats.products}`);
  console.log(`   ✅ Active Products: ${stats.activeProducts}`);
  console.log(`   ⏰ Expiring Soon: ${stats.expiringSoon}`);
  
  console.log('\n🔐 Test Accounts Created:');
  console.log('   Buyer: buyer@example.com / password123');
  console.log('   Seller: seller@example.com / password123');
  
  console.log('\n🎉 Memory database initialized successfully!');
  console.log('\n📝 Note: This is using an in-memory database for testing.');
  console.log('   For production, set up MongoDB Atlas or local MongoDB.');
  
} catch (error) {
  console.error('❌ Failed to initialize memory database:', error);
  process.exit(1);
}

console.log('\n🚀 Ready to start the server!');
console.log('   Run: npm run dev');