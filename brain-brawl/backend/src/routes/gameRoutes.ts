import express, { Request, Response } from 'express';

const router = express.Router();

// Get game history for a user
router.get('/history/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // In a real app: Fetch game history from database
    
    // For demo, return dummy game history
    const gameCount = Math.floor(Math.random() * 10) + 1;
    const gameHistory = Array.from({ length: gameCount }).map((_, index) => {
      const won = Math.random() > 0.5;
      const opponent = `user_${Math.random().toString(36).substring(2, 7)}`;
      const score = Math.floor(Math.random() * 600) + 200;
      const opponentScore = won ? score - Math.floor(Math.random() * 200) : score + Math.floor(Math.random() * 200);
      
      return {
        gameId: Math.random().toString(36).substring(2, 9),
        date: new Date(Date.now() - (index * 86400000)).toISOString(),
        opponent,
        playerScore: score,
        opponentScore,
        won,
        categories: ['History', 'Science', 'Geography', 'Entertainment']
      };
    });
    
    res.json(gameHistory);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', (req: Request, res: Response) => {
  try {
    // In a real app: Fetch top players from database
    
    // For demo, return dummy leaderboard
    const leaderboard = Array.from({ length: 10 }).map((_, index) => ({
      userId: Math.random().toString(36).substring(2, 9),
      username: `player_${Math.random().toString(36).substring(2, 5)}`,
      rank: index + 1,
      score: 1000 - (index * 50) + Math.floor(Math.random() * 30),
      gamesPlayed: Math.floor(Math.random() * 100) + 20,
      winRate: Math.floor(Math.random() * 40) + 60
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;