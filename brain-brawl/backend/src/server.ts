import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketConnection } from './socket';
import triviaRoutes from './routes/triviaRoutes';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/trivia', triviaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Initialize socket connection
setupSocketConnection(io);

// MongoDB connection (if using MongoDB)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Display URL for local network access
  console.log(`\nNetwork access URLs (for other devices on your network):`);
  console.log(`http://172.20.10.8:${PORT} (Use this on other devices)`);
  console.log(`\nLocal access URL (for this computer):`);
  console.log(`http://localhost:${PORT}`);
});

export default server;