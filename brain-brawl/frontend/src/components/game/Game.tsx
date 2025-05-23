import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import Question from './Question';
import RoundResults from './RoundResults';
import GameOver from './GameOver';
import CharacterDisplay from './CharacterDisplay';
import { playSound, playSoundMultiple, stopBackgroundMusic, startBackgroundMusic } from '../../utils/soundUtils';

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
  playerCharacter: string;
  opponentCharacter: string;
  playerAnimation: 'idle' | 'attack' | 'hurt' | 'death';
  opponentAnimation: 'idle' | 'attack' | 'hurt' | 'death';
  playerHealth: number;
  opponentHealth: number;
  rematchRequested: boolean;
  playersWantingRematch: string[];
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
    opponent: null,
    playerCharacter: 'blue',
    opponentCharacter: 'pink',
    playerAnimation: 'idle',
    opponentAnimation: 'idle',
    playerHealth: 100,
    opponentHealth: 100,
    rematchRequested: false,
    playersWantingRematch: []
  });

  // Add a random seed that changes with each new question
  const [randomSeed, setRandomSeed] = useState<number>(Math.random());
  
  const [error, setError] = useState('');
  
  // Create a ref to store the timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!socket || !gameId) {
      setError('Connection to game server lost. Please go back and try again.');
      return;
    }

    // Reset animation states and health when joining a new game
    setGameState(prev => ({
      ...prev,
      playerAnimation: 'idle',
      opponentAnimation: 'idle',
      playerHealth: 1000,
      opponentHealth: 1000,
      rematchRequested: false,
      playersWantingRematch: []
    }));

    // Get character selection from localStorage if it exists
    const savedCharacter = localStorage.getItem('selectedCharacter') || 'blue';
    setGameState(prev => ({...prev, playerCharacter: savedCharacter}));

    // Join the game room
    socket.emit('join_game', {
      gameId,
      userId: user.userId,
      character: savedCharacter
    });
    
    // Listen for match found event to get opponent info
    socket.on('match_found', (data) => {
      // Store opponent info
      if (data.opponent) {
        // Use userId as username initially, to prevent showing IDs briefly
        const opponentUsername = data.opponent.username || data.opponent.userId;
        setGameState(prevState => ({
          ...prevState,
          opponent: {
            ...data.opponent,
            username: opponentUsername // Ensure we always show a username, even if it's just the ID temporarily
          }
        }));
      }
    });
    
    // Set up socket event listeners
    socket.on('game_state', (state) => {
      // Look for player health in the state
      const playerData = state.players?.find((p: any) => p.userId === user.userId);
      const opponentData = state.players?.find((p: any) => p.userId !== user.userId);
      
      // If we don't have opponent username yet, try to get it from the User model
      if (opponentData && (!gameState.opponent || !gameState.opponent.username)) {
        // Keep track of opponent's userId at minimum
        setGameState(prevState => ({
          ...prevState,
          opponent: {
            ...prevState.opponent,
            userId: opponentData.userId,
            username: opponentData.userId // Temporarily use userId as username
          }
        }));
        
        // Try to get actual username from the server using User model
        socket.emit('get_opponent_username', { opponentId: opponentData.userId });
      }
      
      setGameState(prevState => ({
        ...prevState,
        ...state,
        status: 'waiting',
        opponentCharacter: state.opponent?.character || opponentData?.character || 'pink',
        playerHealth: playerData?.health ?? 1000,
        opponentHealth: opponentData?.health ?? 1000
      }));
    });
    
    socket.on('game_starting', () => {
      // Play ready-set-go sound
      playSound('readySetGo');
      
      setGameState(prevState => ({
        ...prevState,
        status: 'starting'
      }));
    });
    
    socket.on('game_started', (state) => {
      // Get player and opponent data including characters
      const playerData = state.players?.find((p: any) => p.userId === user.userId);
      const opponentData = state.players?.find((p: any) => p.userId !== user.userId);

      setGameState(prevState => ({
        ...prevState,
        ...state,
        status: 'active',
        // Ensure characters are correctly set from the game state
        playerCharacter: playerData?.character || prevState.playerCharacter,
        opponentCharacter: opponentData?.character || prevState.opponentCharacter,
        playerHealth: playerData?.health ?? 1000,
        opponentHealth: opponentData?.health ?? 1000,
        // Make sure animation states are reset
        playerAnimation: 'idle',
        opponentAnimation: 'idle',
        rematchRequested: false,
        playersWantingRematch: []
      }));
    });
    
    socket.on('new_question', (data) => {
      console.log('New question received:', data);

      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Generate a completely new random seed for this question
      setRandomSeed(Math.random() * 10000);

      setGameState(prevState => ({
        ...prevState,
        question: data.question,
        round: data.round,
        totalRounds: data.totalRounds,
        timeRemaining: 10,
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
      // NOTE: We don't play sounds here anymore because they're now played immediately when
      // the answer is submitted in handleSubmitAnswer for better user feedback
      
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
      
      // If this contains game state data (from get_game_state request)
      if (update.gameState) {
        // Update with accurate health values from server
        const state = update.gameState;
        const playerData = state.players?.find((p: any) => p.userId === user.userId);
        const opponentData = state.players?.find((p: any) => p.userId !== user.userId);
        
        if (playerData && opponentData) {
          setGameState(prevState => ({
            ...prevState,
            playerHealth: playerData.health,
            opponentHealth: opponentData.health
          }));
        }
      }
      // If this is the opponent answering and they answered correctly, show the effect
      else if (update.playerId !== user.userId && update.isCorrect) {
        // Show opponent attack animation
        setGameState(prevState => ({
          ...prevState,
          opponentAnimation: 'attack',
          playerAnimation: 'hurt'
        }));
        
        // Play hit sound for opponent attacking player
        playSoundMultiple('hit', 3, 200);
        
        // Estimate the damage (this is a rough estimate for immediate feedback)
        const estimatedDamage = 100 + Math.floor(gameState.timeRemaining * 5);
        
        // Update health visually after a short delay
        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            opponentAnimation: 'idle',
            playerAnimation: 'idle',
            // Estimate damage to player's health
            playerHealth: Math.max(0, prevState.playerHealth - estimatedDamage)
          }));
        }, 800);
      }
    });
    
    socket.on('round_results', (results) => {
      console.log('Round results received:', results);
      
      // Clear any active timer when round results come in
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Find player and opponent results to update health and show animations
      const playerResult = results.playerResults.find((r: any) => r.userId === user.userId);
      const opponentResult = results.playerResults.find((r: any) => r.userId !== user.userId);
      
      // First show animations
      if (playerResult && playerResult.damageDealt > 0) {
        // Player deals damage to opponent, show attack animation
        setGameState(prevState => ({
          ...prevState,
          playerAnimation: 'attack',
          opponentAnimation: 'hurt'
        }));
        
        // Play hit sound for player attacking opponent
        playSoundMultiple('hit', 3, 200);
      }
      
      if (opponentResult && opponentResult.damageDealt > 0) {
        // Opponent deals damage to player, show attack animation after a delay
        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            playerAnimation: 'hurt',
            opponentAnimation: 'attack'
          }));
          
          // Play hit sound for opponent attacking player
          playSoundMultiple('hit', 3, 200);
        }, 1000); // Delay opponent's attack animation
      }
      
      // Reset animations and get accurate health from server after animations complete
      setTimeout(() => {
        // Get the game state to show the accurate health values
        if (socket && gameId) {
          socket.emit('get_game_state', { gameId });
        }
        
        setGameState(prevState => {
          // Look for any character updates in the results
          const playerData = results.playerResults.find((r: any) => r.userId === user.userId);
          const opponentData = results.playerResults.find((r: any) => r.userId !== user.userId);
          
          // Check if player or opponent health is zero to show death animation
          // Use the current health after our immediate animations
          // Once a character dies, they remain in 'death' animation state permanently
          const playerAnimation = (prevState.playerAnimation === 'death' || prevState.playerHealth <= 0) ? 'death' : 'idle';
          const opponentAnimation = (prevState.opponentAnimation === 'death' || prevState.opponentHealth <= 0) ? 'death' : 'idle';
          
          return {
            ...prevState,
            roundResults: results,
            status: 'round_results',
            timeRemaining: 0,
            playerAnimation,
            opponentAnimation,
            playerCharacter: playerData?.character || prevState.playerCharacter,
            opponentCharacter: opponentData?.character || prevState.opponentCharacter
          };
        });
      }, 2000); // Update health after animations
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
      
      // Determine if the current player is the winner
      const isWinner = results.winner === user.userId;
      const isTie = results.tie === true;
      
      // Play appropriate sound based on game outcome
      if (isWinner) {
        // Play victory sound for winner
        playSound('success3');
      } else if (isTie) {
        // Play neutral sound for tie
        playSound('ding');
      } else {
        // Play game over sound for loser
        playSound('gameOver');
      }
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Find player data to display final health
      const playerData = results.players.find((p: any) => p.userId === user.userId);
      const opponentData = results.players.find((p: any) => p.userId !== user.userId);
      
      setGameState(prevState => ({
        ...prevState,
        gameResults: results,
        status: 'game_over',
        timeRemaining: 0,
        playerHealth: playerData?.health ?? prevState.playerHealth,
        opponentHealth: opponentData?.health ?? prevState.opponentHealth,
        playerCharacter: playerData?.character || prevState.playerCharacter,
        opponentCharacter: opponentData?.character || prevState.opponentCharacter,
        // Set animations based on final health or previous death state
        playerAnimation: (prevState.playerAnimation === 'death' || playerData?.health <= 0) ? 'death' : 'idle',
        opponentAnimation: (prevState.opponentAnimation === 'death' || opponentData?.health <= 0) ? 'death' : 'idle'
      }));
    });
    
    socket.on('rematch_requested', (data) => {
      // Update UI to show that a player has requested a rematch
      console.log('Rematch requested by:', data.userId);
      console.log('Players who want a rematch:', data.playersWantingRematch);

      // Update state to show who has requested a rematch
      setGameState(prevState => ({
        ...prevState,
        playersWantingRematch: data.playersWantingRematch || []
      }));

      // If the current user isn't the one who requested, play a notification sound
      if (data.userId !== user.userId) {
        playSound('ding'); // Play a sound to notify the user
      }
    });
    
    socket.on('rematch_created', (data) => {
      console.log('Rematch created, navigating to new game:', data.newGameId);

      // Reset the game state before navigating
      setGameState(prevState => ({
        ...prevState,
        rematchRequested: false,
        playersWantingRematch: [],
        playerAnimation: 'idle',
        opponentAnimation: 'idle',
        playerHealth: 1000,
        opponentHealth: 1000
      }));

      // Navigate to the new game
      navigate(`/game/${data.newGameId}`);
    });
    
    socket.on('player_disconnected', (data) => {
      // Handle opponent disconnection
      setError(`Your opponent (${data.userId}) has disconnected from the game.`);
    });
    
    // Handle opponent username response
    socket.on('opponent_username', (data) => {
      // Update opponent username in game state
      setGameState(prevState => ({
        ...prevState,
        opponent: {
          ...prevState.opponent,
          userId: data.userId,
          username: data.username
        }
      }));
    });
    
    // Clean up on unmount
    return () => {
      socket.off('match_found');
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
      socket.off('opponent_username');
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
      timeRemaining: 10
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
    
    // Calculate estimated points and damage for immediate feedback
    const isCorrect = answer === gameState.question.correctAnswer;
    const basePoints = 100;
    const timeBonus = Math.floor(gameState.timeRemaining * 5); // 5 points per second
    const estimatedPoints = isCorrect ? basePoints + timeBonus : 0;
    
    // Play initial sound based on correctness
    if (isCorrect) {
      playSound('success2');
      
      // If correct in multiplayer, also play hit sounds for damage
      if (gameState.opponent) {
        setTimeout(() => {
          playSoundMultiple('hit', 3, 200);
        }, 300);
      }
    } else {
      playSound('wrong');
    }
    
    // Only play attack animation when submitting a correct answer
    // Don't play sounds here - they're already played above
    setGameState(prevState => ({
      ...prevState,
      // Only set animation to 'attack' if the answer is correct
      playerAnimation: isCorrect ? 'attack' : 'idle',
      // If answer is correct, show immediate visual feedback by updating opponent health
      // This is just a visual preview - the server will provide the actual values later
      opponentHealth: isCorrect ?
        Math.max(0, prevState.opponentHealth - estimatedPoints) :
        prevState.opponentHealth
    }));
    
    // Reset to idle after animation completes (only needed for correct answers)
    if (isCorrect) {
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          playerAnimation: 'idle'
        }));
      }, 800);
    }
    
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

    console.log(`Sending rematch request: gameId=${gameId}, userId=${user.userId}`);

    socket.emit('rematch_request', {
      gameId,
      userId: user.userId
    });

    // Update state to show waiting UI
    setGameState(prevState => ({
      ...prevState,
      rematchRequested: true
    }));
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
          <>
            <div className="pokemon-battle-layout">
              {/* Brain Brawl title */}
              <h1 className="retro-title">brain brawl</h1>

              {/* Top stats bar */}
              <div className="battle-stats">
                <p className="category-text">category: {gameState.question ? gameState.question.category.toLowerCase() : ''}</p>
                <p className={gameState.timeRemaining <= 5 ? 'time-low' : ''}>time: {gameState.timeRemaining}s</p>
              </div>

              {/* Battle field with characters */}
              <div className="battle-field">
                {/* Opponent at top left */}
                <div className="opponent-position">
                  <CharacterDisplay
                    character={gameState.opponentCharacter}
                    name={gameState.opponent?.username || 'Opponent'}
                    isOpponent={true}
                    animationState={gameState.opponentAnimation}
                    health={gameState.opponentHealth}
                  />
                </div>

                {/* Player at bottom right */}
                <div className="player-position">
                  <CharacterDisplay
                    character={gameState.playerCharacter}
                    name={user.username}
                    animationState={gameState.playerAnimation}
                    health={gameState.playerHealth}
                  />
                </div>
              </div>

              {/* Battle interface */}
              <div className="battle-interface">
                {/* Question on left */}
                <div className="question-box">
                  <div className="question-text">
                    {gameState.question ?
                      (() => {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = gameState.question.question;
                        const decodedText = tempDiv.textContent || gameState.question.question;
                        return decodedText.toLowerCase();
                      })()
                      : 'loading question...'
                    }
                  </div>
                </div>

                {/* Options on right */}
                <div className="options-box">
                  {gameState.question &&
                    <div className="options-grid">
                      {/* Shuffled answers using true randomization */}
                      {(() => {
                        // Combine all answers
                        const allAnswers = [
                          gameState.question.correctAnswer,
                          ...gameState.question.incorrectAnswers
                        ];

                        // Use the randomSeed state variable which changes with each new question
                        // This ensures different random order in each round but consistent within a round
                        const seed = randomSeed;

                        // Fisher-Yates shuffle with seed for consistent ordering
                        const shuffled = [...allAnswers];
                        const random = (i) => {
                          // Use a seeded random number generator
                          const x = Math.sin(seed + i) * 10000;
                          return x - Math.floor(x);
                        };

                        for (let i = shuffled.length - 1; i > 0; i--) {
                          const j = Math.floor(random(i) * (i + 1));
                          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                        }

                        return shuffled;
                      })().map((answer, index) => {
                        // Format text to handle HTML entities and make lowercase
                        const formatText = (text) => {
                          const tempDiv = document.createElement('div');
                          tempDiv.innerHTML = text;
                          const decodedText = tempDiv.textContent || text;
                          return decodedText.toLowerCase();
                        };

                        return (
                          <button
                            key={index}
                            className={`option-button ${
                              gameState.answer
                              ? answer === gameState.question.correctAnswer
                                ? 'correct-answer'
                                : gameState.answer === answer
                                  ? 'wrong-answer'
                                  : 'disabled'
                              : ''
                            } ${gameState.answer ? 'disabled' : ''}`}
                            onClick={() => {
                              if (!gameState.answer) {
                                handleSubmitAnswer(answer);
                              }
                            }}
                            disabled={!!gameState.answer}
                          >
                            {formatText(answer)}
                          </button>
                        );
                      })}
                    </div>
                  }
                </div>
              </div>

              {/* Answer feedback */}
              {gameState.answerResult && (
                <div className="answer-feedback">
                  {gameState.answerResult.isCorrect ? (
                    <p className="retro-correct">
                      correct! +{gameState.answerResult.pointsEarned} points
                    </p>
                  ) : (
                    <p className="retro-incorrect">
                      incorrect. the correct answer was: {(() => {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = gameState.question.correctAnswer;
                        const decodedText = tempDiv.textContent || gameState.question.correctAnswer;
                        return decodedText.toLowerCase();
                      })()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
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
            rematchRequested={gameState.rematchRequested}
            playersWantingRematch={gameState.playersWantingRematch}
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

              {/* Keep player vs info at the bottom for waiting screen */}
              <div className="retro-player-vs" style={{ marginTop: '20px' }}>
                <div className="retro-player">
                  <p>{user.username}</p>
                </div>
                <div className="retro-vs">vs</div>
                <div className="retro-opponent">
                  <p>{gameState.opponent ? gameState.opponent.username : 'waiting...'}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Player vs Player title inside the card, above the get ready text */}
              <div className="retro-player-vs" style={{
                fontSize: '1.8rem',
                margin: '0 auto 20px auto',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <div className="retro-player">
                  <p style={{ fontWeight: 'bold' }}>{user.username}</p>
                </div>
                <div className="retro-vs" style={{ margin: '0 15px', fontSize: '2rem' }}>vs</div>
                <div className="retro-opponent">
                  <p style={{ fontWeight: 'bold' }}>{gameState.opponent ? gameState.opponent.username : 'waiting...'}</p>
                </div>
              </div>

              <p className="game-starting-text" style={{ fontSize: '1.6rem' }}>brain-brawl game is starting!</p>
              <p className="get-ready-text" style={{ fontSize: '1.5rem' }}>get ready...</p>
              <div className="retro-countdown-sequence">
                <div className="countdown-number">ready</div>
                <div className="countdown-number">set</div>
                <div className="countdown-number">go!</div>
              </div>
            </>
          )}
          <button
            onClick={() => navigate('/')}
            className="retro-button"
          >
            cancel and return home
          </button>
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