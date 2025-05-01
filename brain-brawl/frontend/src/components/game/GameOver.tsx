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
    <div className="retro-content">
      <h1 className="retro-title">
        {isTie ? "it's a tie!" : (isWinner ? "you win!" : "you lose!")}
      </h1>
      
      <div className="retro-menu">
        <div className="retro-final-scores">
          <div className="retro-player-result">
            <h3>your score</h3>
            <div className="retro-score-value">{playerResult?.score || 0}</div>
          </div>
          
          <div className="retro-vs">vs</div>
          
          <div className="retro-opponent-result">
            <h3>opponent score</h3>
            <div className="retro-score-value">{opponentResult?.score || 0}</div>
          </div>
        </div>
        
        <div className="retro-game-stats">
          <p>score difference: {Math.abs((playerResult?.score || 0) - (opponentResult?.score || 0))}</p>
          <p>xp earned: {isWinner ? 100 : (isTie ? 50 : 20)}</p>
        </div>
        
        <div className="retro-action-buttons">
          <button 
            onClick={onRequestRematch}
            className="retro-button"
          >
            rematch
          </button>
          
          <button 
            onClick={() => navigate('/waiting-room')}
            className="retro-button"
          >
            find new opponent
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="retro-button"
          >
            back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;