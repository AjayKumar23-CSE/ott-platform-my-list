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
