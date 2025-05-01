import { useState, useEffect } from 'react';

interface QuestionProps {
  question: {
    id: string;
    question: string;
    correctAnswer: string;
    incorrectAnswers: string[];
    category: string;
    difficulty: string;
  };
  round: number;
  totalRounds: number;
  timeRemaining: number;
  onSubmitAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  answerResult: any;
}

const Question = ({
  question,
  round,
  totalRounds,
  timeRemaining,
  onSubmitAnswer,
  selectedAnswer,
  answerResult
}: QuestionProps) => {
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  
  useEffect(() => {
    if (!question) return;
    
    // Combine correct and incorrect answers
    const allAnswers = [question.correctAnswer, ...question.incorrectAnswers];
    
    // Shuffle answers
    const shuffled = [...allAnswers].sort(() => Math.random() - 0.5);
    
    setShuffledAnswers(shuffled);
  }, [question]);
  
  if (!question) {
    return <div>Loading question...</div>;
  }
  
  // Format for HTML rendering (to handle HTML entities in API response)
  const formatText = (text: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent || text;
  };
  
  // Determine answer button style
  const getAnswerButtonStyle = (answer: string) => {
    if (!selectedAnswer) {
      return 'retro-button option-button';
    }
    
    if (answer === question.correctAnswer) {
      return 'retro-button option-button correct-answer';
    }
    
    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return 'retro-button option-button wrong-answer';
    }
    
    return 'retro-button option-button disabled';
  };
  
  return (
    <div className="retro-content">
      <div className="practice-header">
        <h1 className="retro-title">brain brawl</h1>
        <div className="practice-stats">
          <p>round: {round}/{totalRounds}</p>
          <p>category: {question.category}</p>
          <p className={timeRemaining <= 5 ? 'time-low' : ''}>time: {timeRemaining}s</p>
        </div>
      </div>
      
      <div className="retro-menu practice-container">
        <div className="question-category">{question.difficulty}</div>
        <p className="question-text">{formatText(question.question)}</p>
        
        <div className="options-container">
          {shuffledAnswers.map((answer, index) => (
            <button
              key={index}
              className={getAnswerButtonStyle(answer)}
              onClick={() => !selectedAnswer && onSubmitAnswer(answer)}
              disabled={!!selectedAnswer}
            >
              {formatText(answer)}
            </button>
          ))}
        </div>
        
        {answerResult && (
          <div className="retro-answer-feedback">
            {answerResult.isCorrect ? (
              <p className="retro-correct">
                correct! +{answerResult.pointsEarned} points
              </p>
            ) : (
              <p className="retro-incorrect">
                incorrect. the correct answer was: {formatText(question.correctAnswer)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Question;