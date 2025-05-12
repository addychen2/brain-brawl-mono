import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../common';
import { playSound } from '../../utils/soundUtils';

// Mock question interface
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

// Helper function to shuffle array
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
  // Random seed for truly random ordering between rounds
  const [questionSeed, setQuestionSeed] = useState<number>(Math.random() * 10000);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const navigate = useNavigate();

  // Shuffle options ONLY when question changes
  useEffect(() => {
    const currentQuestion = mockQuestions[currentQuestionIndex];

    // Generate a completely new random seed when question changes
    setQuestionSeed(Math.random() * 10000);

    // Create a seeded shuffle based on the new random seed
    const seededShuffle = (array) => {
      const result = [...array];
      // Seeded random function
      const random = (i) => {
        const x = Math.sin(questionSeed + i) * 10000;
        return x - Math.floor(x);
      };

      // Fisher-Yates with seed
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random(i) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };

    setShuffledOptions(seededShuffle(currentQuestion.options));
  }, [currentQuestionIndex]);

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
      // Play success sound for correct answer
      playSound('success2');
      
      // Award points based on time left - faster answers get more points
      const pointsEarned = Math.max(5, timeLeft);
      setScore(score + pointsEarned);
    } else {
      // Play wrong sound for incorrect answer
      playSound('wrong');
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
        playSound('gameOver');
      }
    }, 2000);
  };

  const handlePlayAgain = () => {
    // Play ding sound when clicking Play Again
    playSound('ding');
    
    // Reset the game state
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
        <BackButton to="/mode-selection" className="back-button-top-left" />
        <h1 className="retro-title">game over</h1>
        <div className="retro-menu">
          <div className="practice-results">
            <p className="practice-score">your score: {score}</p>
            <p>you answered {score > 0 ? Math.ceil(score / 5) : 0} out of {mockQuestions.length} correctly!</p>
          </div>
          <button onClick={handlePlayAgain} className="retro-button">play again</button>
          <button onClick={() => {
            playSound('ding');
            navigate('/mode-selection');
          }} className="retro-button">back to mode selection</button>
          <button onClick={() => {
            playSound('ding');
            navigate('/');
          }} className="retro-button">back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-content">
      <BackButton to="/mode-selection" className="back-button-top-left" />
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
          {shuffledOptions.map((option) => (
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