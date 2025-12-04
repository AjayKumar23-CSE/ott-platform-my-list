import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import myListRoutes from './routes/myListRoutes';
import contentRoutes from './routes/contentRoutes';
import authRoutes from './routes/authRoutes';
import { ApiResponse } from './types';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://ott-platform-my-list-git-main-ajay-kumars-projects-eb5c30ca.vercel.app',
    'https://ott-platform-my-list-pzaovikuo-ajay-kumars-projects-eb5c30ca.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  };
  res.json(response);
});

// Manual seed endpoint for debugging
app.post('/seed', async (req, res) => {
  try {
    const seedModule = require('./scripts/seed');
    const seedDatabase = seedModule.seedDatabase || seedModule.default;
    if (typeof seedDatabase === 'function') {
      await seedDatabase();
      res.json({ success: true, message: 'Database seeded successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Seeder function not found' });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Seeding failed', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Debug endpoint to check data files
app.get('/debug', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, '../data');
    
    const files = ['movies.json', 'tvshows.json', 'users.json', 'auth-users.json'];
    const debug = {};
    
    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        debug[file] = {
          exists: true,
          size: content.length,
          content: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        };
      } else {
        debug[file] = { exists: false };
      }
    });
    
    res.json({ success: true, debug });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/my-list', myListRoutes);
app.use('/api', contentRoutes);

// 404 handler
app.use('*', (req, res) => {
  const response: ApiResponse = {
    success: false,
    error: 'Endpoint not found'
  };
  res.status(404).json(response);
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  const response: ApiResponse = {
    success: false,
    error: 'Internal server error'
  };
  
  res.status(500).json(response);
});

export default app;
