import { useNavigate } from 'react-router-dom';

interface GameOverProps {
  results: {
    players: { userId: string; score: number }[];
    winner: string | null;
    tie: boolean;
  };
  userId: string;
  onRequestRematch: () => void;
}

const GameOver = ({ results, userId, onRequestRematch }: GameOverProps) => {
  const navigate = useNavigate();
  
  if (!results) {
    return <div>Loading results...</div>;
  }
  
  // Find current player and opponent results
  const playerResult = results.players.find(p => p.userId === userId);
  const opponentResult = results.players.find(p => p.userId !== userId);
  
  // Determine game outcome for player
  const isWinner = results.winner === userId;
  const isTie = results.tie;
  const gameOutcome = isTie ? 'It\'s a tie!' : (isWinner ? 'You win!' : 'You lose!');
  
  // Determine background class based on game outcome
  const backgroundClass = isTie ? 'tie-bg' : (isWinner ? 'win-bg' : 'lose-bg');
  
  return (
    <div className={`game-over-container ${backgroundClass}`}>
      <div className="game-outcome">
        <h1>{gameOutcome}</h1>
      </div>
      
      <div className="final-scores">
        <div className="player-score">
          <h3>Your Score</h3>
          <div className="score-value">{playerResult?.score || 0}</div>
        </div>
        
        <div className="vs-indicator">VS</div>
        
        <div className="opponent-score">
          <h3>Opponent's Score</h3>
          <div className="score-value">{opponentResult?.score || 0}</div>
        </div>
      </div>
      
      <div className="game-stats">
        <h3>Game Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Score Difference</span>
            <span className="stat-value">
              {Math.abs((playerResult?.score || 0) - (opponentResult?.score || 0))}
            </span>
          </div>
          
          <div className="stat-card">
            <span className="stat-label">XP Earned</span>
            <span className="stat-value">
              {isWinner ? 100 : (isTie ? 50 : 20)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={onRequestRematch}
          className="primary-button"
        >
          Rematch
        </button>
        
        <button 
          onClick={() => navigate('/waiting-room')}
          className="secondary-button"
        >
          Find New Opponent
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="tertiary-button"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default GameOver;