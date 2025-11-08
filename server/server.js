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
app.use(cors());
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

