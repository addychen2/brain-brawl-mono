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
      return 'answer-button';
    }
    
    if (answer === question.correctAnswer) {
      return 'answer-button correct';
    }
    
    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return 'answer-button incorrect';
    }
    
    return 'answer-button disabled';
  };
  
  return (
    <div className="question-container">
      <div className="question-header">
        <span className="category">{question.category}</span>
        <span className="difficulty">{question.difficulty}</span>
      </div>
      
      <div className="timer-container">
        <div 
          className="timer-bar" 
          style={{ 
            width: `${(timeRemaining / 20) * 100}%`,
            backgroundColor: timeRemaining <= 5 ? '#ff4d4d' : '#4caf50'
          }}
        ></div>
        <span className="timer-text">{timeRemaining}s</span>
      </div>
      
      <div className="question-text">
        <h2>{formatText(question.question)}</h2>
      </div>
      
      <div className="answers-container">
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
        <div className="answer-feedback">
          {answerResult.isCorrect ? (
            <div className="correct-answer">
              <span>✓</span> Correct! +{answerResult.pointsEarned} points
            </div>
          ) : (
            <div className="incorrect-answer">
              <span>✗</span> Incorrect. The correct answer was: {formatText(question.correctAnswer)}
            </div>
          )}
        </div>
      )}
      
      <div className="round-progress">
        Question {round} of {totalRounds}
      </div>
    </div>
  );
};

export default Question;