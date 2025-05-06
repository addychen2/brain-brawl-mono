import { useState, useEffect } from 'react';
import axios from 'axios';

interface LeaderboardPlayer {
  userId: string;
  username: string;
  rank: number;
  score: number;
  gamesPlayed: number;
  winRate: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/game/leaderboard`);
        setLeaderboard(response.data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load the leaderboard. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="leaderboard-container">
      <h1>Brain Brawl Leaderboard</h1>
      <p className="subtitle">See who reigns supreme in the world of trivia!</p>
      
      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Games Played</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player) => (
              <tr key={player.userId} className={player.rank <= 3 ? `top-${player.rank}` : ''}>
                <td>
                  {player.rank <= 3 ? (
                    <span className={`rank-badge rank-${player.rank}`}>
                      {player.rank}
                    </span>
                  ) : (
                    player.rank
                  )}
                </td>
                <td>{player.username}</td>
                <td>{player.score.toLocaleString()}</td>
                <td>{player.gamesPlayed}</td>
                <td>{player.winRate}%</td>
              </tr>
            ))}
            
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={5} className="no-data">
                  No leaderboard data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;