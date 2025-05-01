interface RoundResultsProps {
  results: {
    question: {
      id: string;
      question: string;
      correctAnswer: string;
      incorrectAnswers: string[];
      category: string;
      difficulty: string;
    };
    playerResults: {
      userId: string;
      answer: string | null;
      isCorrect: boolean;
      timeRemaining: number | null;
      pointsEarned: number;
    }[];
  };
  userId: string;
}

const RoundResults = ({ results, userId }: RoundResultsProps) => {
  if (!results) {
    return <div>Loading results...</div>;
  }
  
  // Find current player and opponent results
  const playerResult = results.playerResults.find(p => p.userId === userId);
  const opponentResult = results.playerResults.find(p => p.userId !== userId);
  
  // Format for HTML rendering (to handle HTML entities in API response)
  const formatText = (text: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || text;
  };
  
  // Calculate time taken to answer
  const getTimeText = (timeRemaining: number | null) => {
    if (timeRemaining === null) return 'No answer';
    const timeTaken = 20 - timeRemaining / 1000;
    return `${timeTaken.toFixed(1)}s`;
  };
  
  return (
    <div className="retro-content">
      <h1 className="retro-title">round results</h1>
      
      <div className="retro-menu">
        <div className="question-recap">
          <p className="question-text">{formatText(results.question.question)}</p>
          <div className="retro-correct-answer">
            <span>correct answer:</span> {formatText(results.question.correctAnswer)}
          </div>
        </div>
        
        <div className="retro-results-comparison">
          <div className="retro-player-result">
            <h3>you:</h3>
            <div className={`retro-result-card ${playerResult?.isCorrect ? 'retro-correct' : 'retro-incorrect'}`}>
              <div className="retro-answer-status">
                {playerResult?.isCorrect ? '✓ correct' : '✗ incorrect'}
              </div>
              <p>
                answer: {playerResult?.answer ? formatText(playerResult.answer) : 'no answer'}
              </p>
              <p>
                time: {getTimeText(playerResult?.timeRemaining)}
              </p>
              <p>
                points: +{playerResult?.pointsEarned}
              </p>
            </div>
          </div>
          
          <div className="retro-vs">vs</div>
          
          <div className="retro-opponent-result">
            <h3>opponent:</h3>
            <div className={`retro-result-card ${opponentResult?.isCorrect ? 'retro-correct' : 'retro-incorrect'}`}>
              <div className="retro-answer-status">
                {opponentResult?.isCorrect ? '✓ correct' : '✗ incorrect'}
              </div>
              <p>
                answer: {opponentResult?.answer ? formatText(opponentResult.answer) : 'no answer'}
              </p>
              <p>
                time: {getTimeText(opponentResult?.timeRemaining)}
              </p>
              <p>
                points: +{opponentResult?.pointsEarned}
              </p>
            </div>
          </div>
        </div>
        
        <div className="retro-next-info">
          <p>next question coming up...</p>
          <div className="retro-loader"></div>
        </div>
      </div>
    </div>
  );
};

export default RoundResults;