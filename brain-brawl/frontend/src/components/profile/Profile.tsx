import { useState, useEffect } from 'react';
import axios from 'axios';
import GameHistory from './GameHistory';

interface ProfileProps {
  user: any;
}

interface ProfileData {
  userId: string;
  username: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    averageScore: number;
  };
}

interface GameHistoryItem {
  gameId: string;
  date: string;
  opponent: string;
  playerScore: number;
  opponentScore: number;
  won: boolean;
  categories: string[];
}

const Profile = ({ user }: ProfileProps) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch profile data
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile/${user.userId}`
        );
        
        // Fetch game history
        const historyResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/game/history/${user.userId}`
        );
        
        setProfileData(profileResponse.data);
        setGameHistory(historyResponse.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user.userId]);
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading profile data...</p>
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
  
  // Calculate win rate
  const winRate = profileData 
    ? Math.round((profileData.stats.gamesWon / profileData.stats.gamesPlayed) * 100) || 0
    : 0;
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {/* Display first letter of username */}
          <span>{profileData?.username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="profile-info">
          <h1>{profileData?.username}</h1>
          <p className="user-id">ID: {profileData?.userId}</p>
        </div>
      </div>
      
      <div className="stats-container">
        <h2>Your Statistics</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{profileData?.stats.gamesPlayed}</span>
            <span className="stat-label">Games Played</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">{winRate}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">{profileData?.stats.averageScore}</span>
            <span className="stat-label">Avg. Score</span>
          </div>
        </div>
      </div>
      
      <div className="game-history-section">
        <h2>Recent Games</h2>
        
        <GameHistory games={gameHistory} />
      </div>
    </div>
  );
};

export default Profile;