interface GameHistoryProps {
  games: {
    gameId: string;
    date: string;
    opponent: string;
    playerScore: number;
    opponentScore: number;
    won: boolean;
    categories: string[];
  }[];
}

const GameHistory = ({ games }: GameHistoryProps) => {
  if (games.length === 0) {
    return (
      <div className="no-games-message">
        <p>You haven't played any games yet. Start playing to see your game history!</p>
      </div>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="game-history-container">
      <div className="game-history-list">
        {games.map((game) => (
          <div 
            key={game.gameId}
            className={`game-history-item ${game.won ? 'win' : 'loss'}`}
          >
            <div className="game-date">
              {formatDate(game.date)}
            </div>
            
            <div className="game-details">
              <div className="result-badge">
                {game.won ? 'WIN' : 'LOSS'}
              </div>
              
              <div className="opponent-info">
                <span className="vs-text">vs</span>
                <span className="opponent-name">{game.opponent}</span>
              </div>
              
              <div className="game-score">
                {game.playerScore} - {game.opponentScore}
              </div>
            </div>
            
            <div className="game-categories">
              {game.categories.slice(0, 3).map((category, index) => (
                <span key={index} className="category-tag">
                  {category}
                </span>
              ))}
              {game.categories.length > 3 && (
                <span className="more-categories">
                  +{game.categories.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameHistory;