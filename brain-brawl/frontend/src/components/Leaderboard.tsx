import { useState, useEffect } from 'react';
import axios from 'axios';
import { BackButton } from './common';

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
      <div className="retro-content">
        <BackButton to="/" className="back-button-top-left" />
        <h1 className="retro-title">leaderboard</h1>
        <div className="retro-loader"></div>
        <p className="loading-text">loading leaderboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="retro-content">
        <BackButton to="/" className="back-button-top-left" />
        <h1 className="retro-title">leaderboard</h1>
        <div className="retro-menu">
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retro-button"
          >
            retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="retro-content">
      <BackButton to="/" className="back-button-top-left" />
      <h1 className="retro-title">leaderboard</h1>
      <p className="leaderboard-subtitle">see who reigns supreme in the world of trivia!</p>
      
      <div className="retro-leaderboard-container">
        <table className="retro-leaderboard-table">
          <thead>
            <tr>
              <th>rank</th>
              <th>player</th>
              <th>score</th>
              <th>games</th>
              <th>win %</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player) => (
              <tr key={player.userId} className={player.rank <= 3 ? `retro-rank-${player.rank}` : ''}>
                <td>
                  {player.rank <= 3 ? (
                    <span className={`retro-rank-badge retro-rank-${player.rank}`}>
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
                <td colSpan={5} className="retro-no-data">
                  no leaderboard data available yet.
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