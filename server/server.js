import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/users.js';
import { initializeTestUser } from './db/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize test user for development (async)
initializeTestUser().catch(console.error);

// Middleware
// Configure CORS to allow requests from GitHub Pages and localhost
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : ['https://lanti04.github.io', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BuildFlow API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`BuildFlow API server running on port ${PORT}`);
});

