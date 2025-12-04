import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

// Railway sets PORT automatically, fallback to 3000 for local development
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  try {
    console.log('🗂️  Using file-based storage (no database required)');
    console.log(`🔧 Environment PORT: ${process.env.PORT}`);
    console.log(`🔧 Using PORT: ${PORT}`);
    
    // Check if data exists, if not, seed it
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, '../data');
    const moviesFile = path.join(dataDir, 'movies.json');
    
    if (!fs.existsSync(moviesFile) || fs.readFileSync(moviesFile, 'utf8').trim() === '[]') {
      console.log('🌱 No content data found, running seeder...');
      try {
        const seedModule = require('./scripts/seed');
        const seedDatabase = seedModule.seedDatabase || seedModule.default;
        if (typeof seedDatabase === 'function') {
          await seedDatabase();
          console.log('✅ Data seeding completed');
        } else {
          console.log('⚠️ Seeder function not found, skipping...');
        }
      } catch (error) {
        console.log('⚠️ Could not run seeder:', error instanceof Error ? error.message : String(error));
        console.log('📝 Continuing without seeded data...');
      }
    }
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💾 Data stored in: backend/data/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  console.log('✅ Server closed successfully');
  process.exit(0);
});

startServer();
