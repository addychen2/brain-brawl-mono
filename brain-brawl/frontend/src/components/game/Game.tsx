import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import Question from './Question';
import RoundResults from './RoundResults';
import GameOver from './GameOver';

interface GameState {
  status: 'waiting' | 'starting' | 'active' | 'round_results' | 'game_over';
  question: any;
  round: number;
  totalRounds: number;
  timeRemaining: number;
  answer: string | null;
  answerResult: any;
  roundResults: any;
  gameResults: any;
  opponent: any;
}

interface GameProps {
  socket: Socket | null;
  user: any;
}

const Game = ({ socket, user }: GameProps) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    question: null,
    round: 0,
    totalRounds: 10,
    timeRemaining: 20,
    answer: null,
    answerResult: null,
    roundResults: null,
    gameResults: null,
    opponent: null
  });
  
  const [error, setError] = useState('');
  
  // Create a ref to store the timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!socket || !gameId) {
      setError('Connection to game server lost. Please go back and try again.');
      return;
    }
    
    // Join the game room
    socket.emit('join_game', { gameId, userId: user.userId });
    
    // Set up socket event listeners
    socket.on('game_state', (state) => {
      setGameState(prevState => ({
        ...prevState,
        ...state,
        status: 'waiting'
      }));
    });
    
    socket.on('game_starting', () => {
      setGameState(prevState => ({
        ...prevState,
        status: 'starting'
      }));
    });
    
    socket.on('game_started', (state) => {
      setGameState(prevState => ({
        ...prevState,
        ...state,
        status: 'active'
      }));
    });
    
    socket.on('new_question', (data) => {
      console.log('New question received:', data);
      
      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setGameState(prevState => ({
        ...prevState,
        question: data.question,
        round: data.round,
        totalRounds: data.totalRounds,
        timeRemaining: 20,
        answer: null,
        answerResult: null,
        status: 'active'
      }));
      
      // Start a new timer with a small delay to ensure state is updated
      setTimeout(() => {
        startTimer();
      }, 100);
    });
    
    socket.on('answer_result', (result) => {
      setGameState(prevState => ({
        ...prevState,
        answerResult: result
      }));
      
      // If there was an error, log it
      if (result.error) {
        console.error(`Answer error: ${result.error}`);
      }
    });
    
    // Listen for updates about other players answering
    socket.on('game_state_update', (update) => {
      console.log('Game state update:', update);
      // We could use this to show which players have answered
    });
    
    socket.on('round_results', (results) => {
      console.log('Round results received:', results);
      
      // Clear any active timer when round results come in
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setGameState(prevState => ({
        ...prevState,
        roundResults: results,
        status: 'round_results',
        timeRemaining: 0
      }));
    });
    
    socket.on('time_up', () => {
      console.log('Time up received from server');
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Update state
      setGameState(prevState => ({
        ...prevState,
        timeRemaining: 0
      }));
    });
    
    socket.on('game_over', (results) => {
      console.log('Game over received:', results);
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setGameState(prevState => ({
        ...prevState,
        gameResults: results,
        status: 'game_over',
        timeRemaining: 0
      }));
    });
    
    socket.on('rematch_requested', (data) => {
      // Maybe show a notification that opponent requested rematch
      console.log('Rematch requested by:', data.userId);
    });
    
    socket.on('rematch_created', (data) => {
      // Navigate to the new game
      navigate(`/game/${data.newGameId}`);
    });
    
    socket.on('player_disconnected', (data) => {
      // Handle opponent disconnection
      setError(`Your opponent (${data.userId}) has disconnected from the game.`);
    });
    
    // Clean up on unmount
    return () => {
      socket.off('game_state');
      socket.off('game_starting');
      socket.off('game_started');
      socket.off('new_question');
      socket.off('answer_result');
      socket.off('game_state_update');
      socket.off('round_results');
      socket.off('time_up');
      socket.off('game_over');
      socket.off('rematch_requested');
      socket.off('rematch_created');
      socket.off('player_disconnected');
    };
  
    // Add a cleanup function to clear the timer when the component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [socket, gameId, user.userId, navigate]);
  
  
  const startTimer = () => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset timer
    setGameState(prevState => ({
      ...prevState,
      timeRemaining: 20
    }));
    
    // Start countdown
    timerRef.current = setInterval(() => {
      setGameState(prevState => {
        // If we're not in the active question state, stop timer
        if (prevState.status !== 'active') {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prevState;
        }
        
        // If time is up
        if (prevState.timeRemaining <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return {
            ...prevState,
            timeRemaining: 0
          };
        }
        
        return {
          ...prevState,
          timeRemaining: prevState.timeRemaining - 1
        };
      });
    }, 1000);
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  };
  
  const handleSubmitAnswer = (answer: string) => {
    if (!socket || !gameId || gameState.answer) return;
    
    // Submit answer to server
    socket.emit('submit_answer', {
      gameId,
      userId: user.userId,
      answer,
      timeRemaining: gameState.timeRemaining * 1000 // Convert to milliseconds
    });
    
    // Update local state
    setGameState(prevState => ({
      ...prevState,
      answer
    }));
  };
  
  const handleRequestRematch = () => {
    if (!socket || !gameId) return;
    
    socket.emit('rematch_request', {
      gameId,
      userId: user.userId
    });
  };
  
  const renderGameContent = () => {
    switch (gameState.status) {
      case 'waiting':
        return (
          <div className="waiting-container">
            <h2>Waiting for opponent...</h2>
            <div className="loader"></div>
            <p>Game ID: {gameId}</p>
          </div>
        );
        
      case 'starting':
        return (
          <div className="starting-container">
            <h2>Game is starting!</h2>
            <div className="countdown">Get ready...</div>
          </div>
        );
        
      case 'active':
        return (
          <Question
            question={gameState.question}
            round={gameState.round}
            totalRounds={gameState.totalRounds}
            timeRemaining={gameState.timeRemaining}
            onSubmitAnswer={handleSubmitAnswer}
            selectedAnswer={gameState.answer}
            answerResult={gameState.answerResult}
          />
        );
        
      case 'round_results':
        return (
          <RoundResults
            results={gameState.roundResults}
            userId={user.userId}
          />
        );
        
      case 'game_over':
        return (
          <GameOver
            results={gameState.gameResults}
            userId={user.userId}
            onRequestRematch={handleRequestRematch}
          />
        );
        
      default:
        return <div>Something went wrong. Please refresh the page.</div>;
    }
  };
  
  if (error) {
    return (
      <div className="retro-content">
        <h1 className="retro-title">error</h1>
        <div className="retro-menu">
          <p className="retro-error">{error}</p>
          <button 
            onClick={() => navigate('/waiting-room')} 
            className="retro-button"
          >
            back to waiting room
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="retro-button"
          >
            back to home
          </button>
        </div>
      </div>
    );
  }
  
  // For waiting and starting states, use retro styling
  if (gameState.status === 'waiting' || gameState.status === 'starting') {
    return (
      <div className="retro-content">
        <h1 className="retro-title">brain brawl</h1>
        <div className="retro-menu">
          {gameState.status === 'waiting' ? (
            <>
              <p>waiting for opponent...</p>
              <p className="retro-game-id">game id: {gameId}</p>
              <div className="retro-loader"></div>
            </>
          ) : (
            <>
              <p>game is starting!</p>
              <p>get ready...</p>
              <div className="retro-countdown">3</div>
            </>
          )}
          <button 
            onClick={() => navigate('/')} 
            className="retro-button"
          >
            cancel and return home
          </button>
        </div>
        
        <div className="retro-player-vs">
          <div className="retro-player">
            <p>{user.username}</p>
          </div>
          <div className="retro-vs">vs</div>
          <div className="retro-opponent">
            <p>{gameState.opponent ? gameState.opponent.username : 'waiting...'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // For active, round_results, and game_over states, let their components handle the styling
  return (
    <div className="game-content">
      {renderGameContent()}
    </div>
  );
};

export default Game;