import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
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
app.get('/health', (req: Request, res: Response) => {
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
  
  // Display URLs for network access
  console.log(`\nNetwork access URLs (for other devices on your network):`);
  
  // Find all IPv4 addresses
  let externalIPs: string[] = [];
  
  // Get network interfaces
  const nets = os.networkInterfaces();
  
  // Loop through interfaces
  Object.keys(nets).forEach(name => {
    const networkInterface = nets[name];
    if (networkInterface) {
      networkInterface.forEach((net: any) => {
        // Only interested in IPv4 and non-internal addresses
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`http://${net.address}:${PORT} (Interface: ${name})`);
          externalIPs.push(net.address);
        }
      });
    }
  });
  
  // If no external IPs found
  if (externalIPs.length === 0) {
    console.log(`No external network interfaces found. Other devices may not be able to connect.`);
  }
  
  console.log(`\nLocal access URL (for this computer):`);
  console.log(`http://localhost:${PORT}`);
});

export default server;