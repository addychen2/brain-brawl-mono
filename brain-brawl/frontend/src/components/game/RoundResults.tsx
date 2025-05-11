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
    const timeTaken = 10 - timeRemaining / 1000; // Using 10 seconds for questions
    return `${timeTaken.toFixed(1)}s`;
  };
  
  return (
    <div className="retro-content">
      <h1 className="retro-title">round results</h1>

      <div className="retro-menu">
        <div className="question-recap">
          <p className="question-text" style={{ fontSize: '1.5rem' }}>{formatText(results.question.question)}</p>
          <div className="retro-correct-answer" style={{ fontSize: '1.4rem', marginTop: '10px' }}>
            <span>correct answer:</span> {formatText(results.question.correctAnswer)}
          </div>
        </div>

        <div className="retro-results-comparison">
          <div className="retro-player-result">
            <h3 style={{ fontSize: '1.6rem' }}>you:</h3>
            <div className={`retro-result-card ${playerResult?.isCorrect ? 'retro-correct' : 'retro-incorrect'}`} style={{ backgroundColor: '#222', boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
              <div className="retro-answer-status" style={{ fontSize: '1.6rem' }}>
                {playerResult?.isCorrect ? '✓ correct' : '✗ incorrect'}
              </div>
              <p style={{ fontSize: '1.3rem', margin: '10px 0' }}>
                answer: {playerResult?.answer ? formatText(playerResult.answer) : 'no answer'}
              </p>
              <p style={{ fontSize: '1.3rem', margin: '10px 0' }}>
                time: {getTimeText(playerResult?.timeRemaining)}
              </p>
              <p style={{ fontSize: '1.3rem', margin: '10px 0' }}>
                points: +{playerResult?.pointsEarned}
              </p>
            </div>
          </div>

          <div className="retro-vs" style={{ fontSize: '2rem' }}>vs</div>

          <div className="retro-opponent-result">
            <h3 style={{ fontSize: '1.6rem' }}>opponent:</h3>
            <div className={`retro-result-card ${opponentResult?.isCorrect ? 'retro-correct' : 'retro-incorrect'}`} style={{ backgroundColor: '#222', boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
              <div className="retro-answer-status" style={{ fontSize: '1.6rem' }}>
                {opponentResult?.isCorrect ? '✓ correct' : '✗ incorrect'}
              </div>
              <p style={{ fontSize: '1.3rem', margin: '10px 0' }}>
                answer: {opponentResult?.answer ? formatText(opponentResult.answer) : 'no answer'}
              </p>
              <p style={{ fontSize: '1.3rem', margin: '10px 0' }}>
                time: {getTimeText(opponentResult?.timeRemaining)}
              </p>
              <p style={{ fontSize: '1.3rem', margin: '10px 0' }}>
                points: +{opponentResult?.pointsEarned}
              </p>
            </div>
          </div>
        </div>

        <div className="retro-next-info" style={{ fontSize: '1.4rem', marginTop: '20px' }}>
          <p>next question coming up...</p>
          <div className="retro-loader"></div>
        </div>
      </div>
    </div>
  );
};

export default RoundResults;