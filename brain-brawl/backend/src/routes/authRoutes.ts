import express, { Request, Response } from 'express';
import User from '../models/User';

const router = express.Router();

// User registration
router.post('/register', async function(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new user
    // Note: In a production app, you would hash the password first
    const newUser = new User({
      username,
      password, // In production, use: await bcrypt.hash(password, 10)
    });
    
    // Save user to database
    await newUser.save();
    
    // Return success without password
    res.status(201).json({ 
      userId: newUser._id,
      username: newUser.username,
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User login
router.post('/login', async function(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Verify password
    // Note: In a production app, you would compare hashed passwords
    const isPasswordValid = user.password === password; // In production, use: await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Return user data
    res.json({ 
      userId: user._id,
      username: user.username,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile/:userId', async function(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate win rate
    const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;

    // Return user profile
    res.json({
      userId: user._id,
      username: user.username,
      stats: {
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        winRate: winRate,
        score: user.score
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;