import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock question interface
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

// Mock data for practice mode
const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'What is the capital of France?',
    options: ['Berlin', 'London', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    category: 'Geography'
  },
  {
    id: 2,
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    category: 'Science'
  },
  {
    id: 3,
    question: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 'Leonardo da Vinci',
    category: 'Art'
  },
  {
    id: 4,
    question: 'Which year did World War II end?',
    options: ['1943', '1945', '1947', '1950'],
    correctAnswer: '1945',
    category: 'History'
  },
  {
    id: 5,
    question: 'What is the chemical symbol for gold?',
    options: ['Gd', 'Go', 'Au', 'Ag'],
    correctAnswer: 'Au',
    category: 'Science'
  }
];

const PracticeMode = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const navigate = useNavigate();

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(null); // Time's up, no answer selected
    }
  }, [timeLeft, isAnswered]);

  const handleAnswer = (answer: string | null) => {
    setIsAnswered(true);
    setSelectedOption(answer);
    
    const currentQuestion = mockQuestions[currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      // Award points based on time left - faster answers get more points
      const pointsEarned = Math.max(5, timeLeft);
      setScore(score + pointsEarned);
    }
    
    // Move to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(20);
        setIsAnswered(false);
        setSelectedOption(null);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const handlePlayAgain = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(20);
    setIsAnswered(false);
    setSelectedOption(null);
    setGameOver(false);
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];

  if (gameOver) {
    return (
      <div className="retro-content">
        <h1 className="retro-title">game over</h1>
        <div className="retro-menu">
          <div className="practice-results">
            <p className="practice-score">your score: {score}</p>
            <p>you answered {score > 0 ? Math.ceil(score / 5) : 0} out of {mockQuestions.length} correctly!</p>
          </div>
          <button onClick={handlePlayAgain} className="retro-button">play again</button>
          <button onClick={() => navigate('/mode-selection')} className="retro-button">back to mode selection</button>
          <button onClick={() => navigate('/')} className="retro-button">back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-content">
      <div className="practice-header">
        <h1 className="retro-title">practice mode</h1>
        <div className="practice-stats">
          <p>score: {score}</p>
          <p>question: {currentQuestionIndex + 1}/{mockQuestions.length}</p>
          <p className={timeLeft <= 5 ? 'time-low' : ''}>time: {timeLeft}s</p>
        </div>
      </div>
      
      <div className="retro-menu practice-container">
        <div className="question-category">{currentQuestion.category}</div>
        <p className="question-text">{currentQuestion.question}</p>
        
        <div className="options-container">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => !isAnswered && handleAnswer(option)}
              className={`retro-button option-button ${
                isAnswered 
                  ? option === currentQuestion.correctAnswer 
                    ? 'correct-answer'
                    : option === selectedOption 
                      ? 'wrong-answer' 
                      : ''
                  : ''
              }`}
              disabled={isAnswered}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;