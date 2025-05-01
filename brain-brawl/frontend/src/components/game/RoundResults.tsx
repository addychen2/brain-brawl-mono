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
    <div className="round-results-container">
      <h2>Round Results</h2>
      
      <div className="question-recap">
        <h3>Question:</h3>
        <p>{formatText(results.question.question)}</p>
        <div className="correct-answer">
          <span>Correct Answer:</span> {formatText(results.question.correctAnswer)}
        </div>
      </div>
      
      <div className="players-results">
        <div className="result-comparison">
          <div className="player-column">
            <h3>You</h3>
            <div className={`result-card ${playerResult?.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="answer-status">
                {playerResult?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </div>
              <div className="answer-details">
                <p>
                  <span>Your answer:</span> {playerResult?.answer ? formatText(playerResult.answer) : 'No answer'}
                </p>
                <p>
                  <span>Time:</span> {getTimeText(playerResult?.timeRemaining)}
                </p>
                <p>
                  <span>Points earned:</span> {playerResult?.pointsEarned}
                </p>
              </div>
            </div>
          </div>
          
          <div className="vs-indicator">VS</div>
          
          <div className="opponent-column">
            <h3>Opponent</h3>
            <div className={`result-card ${opponentResult?.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="answer-status">
                {opponentResult?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </div>
              <div className="answer-details">
                <p>
                  <span>Their answer:</span> {opponentResult?.answer ? formatText(opponentResult.answer) : 'No answer'}
                </p>
                <p>
                  <span>Time:</span> {getTimeText(opponentResult?.timeRemaining)}
                </p>
                <p>
                  <span>Points earned:</span> {opponentResult?.pointsEarned}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="next-round-info">
        <p>Next question coming up...</p>
        <div className="loader small"></div>
      </div>
    </div>
  );
};

export default RoundResults;