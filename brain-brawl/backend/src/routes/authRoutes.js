"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Simple user registration
// In a real app, you'd want to use proper authentication and store users in a database
router.post('/register', (req, res) => {
    try {
        const { username, password } = req.body;
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        // In a real app: Check if user exists, hash password, save to database
        // For demo, just return success
        res.status(201).json({
            userId: Math.random().toString(36).substring(2, 15),
            username,
            message: 'User registered successfully'
        });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Simple login
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        // In a real app: Verify credentials against database
        // For demo, just return success with dummy user ID
        res.json({
            userId: Math.random().toString(36).substring(2, 15),
            username,
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get user profile
router.get('/profile/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        // In a real app: Fetch user data from database
        // For demo, return dummy profile
        res.json({
            userId,
            username: `user_${userId.substring(0, 5)}`,
            stats: {
                gamesPlayed: Math.floor(Math.random() * 50),
                gamesWon: Math.floor(Math.random() * 30),
                averageScore: Math.floor(Math.random() * 800) + 200
            }
        });
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
