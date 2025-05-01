"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_1 = require("./socket");
const triviaRoutes_1 = __importDefault(require("./routes/triviaRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/trivia', triviaRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/game', gameRoutes_1.default);
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Socket.io setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});
// Initialize socket connection
(0, socket_1.setupSocketConnection)(io);
// MongoDB connection (if using MongoDB)
if (process.env.MONGODB_URI) {
    mongoose_1.default.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}
// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = server;
