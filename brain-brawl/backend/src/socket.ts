import { Server, Socket } from 'socket.io';
import { TriviaGame } from './models/TriviaGame';

// Store active games and player connections
const activeGames = new Map<string, TriviaGame>();
const playerConnections = new Map<string, string>(); // userId -> gameId
const waitingPlayers = new Map<string, { userId: string, character?: string }>(); // socketId -> userData

export const setupSocketConnection = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join waiting room to find an opponent
    socket.on('join_waiting_room', (data: string | { userId: string, character?: string }) => {
      const userId = typeof data === 'object' ? data.userId : data;
      const character = (typeof data === 'object' && data.character) ? data.character : 'blue';
      
      console.log(`User ${userId} joined waiting room with character ${character}`);
      
      // Store this player in the waiting room
      waitingPlayers.set(socket.id, { userId, character });
      playerConnections.set(userId, 'waiting_room');
      
      console.log(`Current waiting players: ${Array.from(waitingPlayers.values()).map(p => p.userId).join(', ')}`);
      
      socket.join('waiting_room');
      findMatch(socket, data, io);
    });

    // Join specific game room
    socket.on('join_game', (data: { gameId: string, userId: string, character?: string }) => {
      const { gameId, userId, character } = data;
      const playerCharacter = character || 'blue';
      console.log(`User ${userId} joined game ${gameId} with character ${playerCharacter}`);
      
      // Associate this user with this game
      playerConnections.set(userId, gameId);
      
      // Add the socket to the game's room
      socket.join(gameId);
      
      // Check if game exists
      const game = activeGames.get(gameId);
      if (game) {
        // Update player character if joining with character data
        if (character) {
          game.getGameState().players.forEach(player => {
            if (player.userId === userId) {
              player.character = character;
            }
          });
        }
        
        // Send game state to the joining player
        socket.emit('game_state', game.getGameState());
        
        // If all players have joined, start the game
        if (game.hasAllPlayers()) {
          io.to(gameId).emit('game_starting', { 
            message: 'All players have joined. Game starting in 3 seconds!'
          });
          
          // Start game after a short delay
          setTimeout(() => {
            game.startGame();
            io.to(gameId).emit('game_started', game.getGameState());
            sendNextQuestion(io, gameId);
          }, 3000);
        }
      }
    });

    // Handle answer submission
    socket.on('submit_answer', (data: { gameId: string, userId: string, answer: string, timeRemaining: number }) => {
      const { gameId, userId, answer, timeRemaining } = data;
      const game = activeGames.get(gameId);
      
      if (!game) {
        console.error(`Game not found: ${gameId}`);
        socket.emit('answer_result', { 
          isCorrect: false, 
          pointsEarned: 0, 
          error: 'Game not found' 
        });
        return;
      }
      
      try {
        const result = game.submitAnswer(userId, answer, timeRemaining);
        
        // Send result to the player who submitted
        socket.emit('answer_result', result);
        
        // If there was an error, don't proceed with game logic
        if (result.error) {
          console.error(`Error processing answer: ${result.error}`);
          return;
        }
        
        // Send game state update to all players
        io.to(gameId).emit('game_state_update', {
          playerId: userId,
          hasAnswered: true,
          isCorrect: result.isCorrect
        });
        
        // If all players have answered, clear timer and move to next question
        if (game.shouldMoveToNextQuestion()) {
          console.log(`All players answered, showing round results for game ${gameId}`);
          
          // Clear the question timer since all players answered
          if (questionTimers.has(gameId)) {
            clearTimeout(questionTimers.get(gameId)!);
            questionTimers.delete(gameId);
          }
          
          // First get the round results
          const roundResults = game.getRoundResults();
          
          // Apply damage to players based on round results
          game.applyDamage();
          
          // Send round results including damage information
          io.to(gameId).emit('round_results', roundResults);
          
          // Wait a few seconds before moving to next question
          setTimeout(() => {
            // If game is over, send final results
            if (game.isGameOver()) {
              const finalResults = game.getFinalResults();
              io.to(gameId).emit('game_over', finalResults);
              
              // Update player stats in database
              updatePlayerStats(finalResults);
              
              // Clean up the game
              activeGames.delete(gameId);
              game.getPlayerIds().forEach(id => playerConnections.delete(id));
            } else {
              game.moveToNextQuestion();
              sendNextQuestion(io, gameId);
            }
          }, 5000);
        }
      } catch (error: any) {
        console.error(`Error processing answer: ${error.message}`);
        socket.emit('answer_result', { 
          isCorrect: false, 
          pointsEarned: 0, 
          error: error.message 
        });
      }
    });

    // Handle player rematch request
    socket.on('rematch_request', (data: { gameId: string, userId: string }) => {
      const { gameId, userId } = data;
      const game = activeGames.get(gameId);
      
      if (game) {
        game.requestRematch(userId);
        
        // If all players want a rematch, create a new game
        if (game.allPlayersWantRematch()) {
          const playerIds = game.getPlayerIds();
          const newGame = new TriviaGame(playerIds);
          const newGameId = generateGameId();
          
          activeGames.set(newGameId, newGame);
          
          // Update player connections to point to new game
          playerIds.forEach(id => playerConnections.set(id, newGameId));
          
          // Inform players of new game
          io.to(gameId).emit('rematch_created', { 
            newGameId,
            message: 'All players accepted rematch. New game created!'
          });
        } else {
          // Let players know someone requested a rematch
          io.to(gameId).emit('rematch_requested', { 
            userId,
            message: `Player ${userId} requested a rematch`
          });
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      handleDisconnect(socket);
    });
    
    // Fetch current game state (used to sync health values)
    socket.on('get_game_state', (data: { gameId: string }) => {
      const { gameId } = data;
      const game = activeGames.get(gameId);
      
      if (game) {
        socket.emit('game_state_update', {
          gameState: game.getGameState()
        });
      }
    });
    
    // Get opponent username from User model
    socket.on('get_opponent_username', async (data: { opponentId: string }) => {
      try {
        const { opponentId } = data;
        
        // Try to import User model
        let User;
        try {
          User = require('./models/User').default;
        } catch (error) {
          console.log('User model not found, using user ID as username');
          // Send back the opponent ID as the username if model not found
          socket.emit('opponent_username', { 
            userId: opponentId, 
            username: opponentId
          });
          return;
        }
        
        // Find user in database
        const user = await User.findById(opponentId);
        
        if (user) {
          // Send username to client
          socket.emit('opponent_username', { 
            userId: opponentId, 
            username: user.username 
          });
        } else {
          // If user not found, use ID as username
          socket.emit('opponent_username', { 
            userId: opponentId, 
            username: opponentId
          });
        }
      } catch (error) {
        console.error('Error fetching opponent username:', error);
        // On error, fall back to using user ID
        socket.emit('opponent_username', { 
          userId: data.opponentId, 
          username: data.opponentId
        });
      }
    });
  });
};

// Data interface for player joining waiting room
interface PlayerData {
  userId: string;
  character?: string;
}

// Find a match for a player in the waiting room
function findMatch(socket: Socket, playerData: string | PlayerData, io: Server) {
  const userId = typeof playerData === 'object' ? playerData.userId : playerData;
  const character = (typeof playerData === 'object' && playerData.character) ? playerData.character : 'blue';
  
  // Get all sockets in waiting room
  io.in('waiting_room').fetchSockets().then(sockets => {
    // Filter out the current socket
    const availablePlayers = sockets.filter(s => s.id !== socket.id);
    
    // If there's at least one other player waiting
    if (availablePlayers.length > 0) {
      const opponent = availablePlayers[0];
      
      // Get the opponent's data directly from our waiting players map
      const opponentData = waitingPlayers.get(opponent.id);
      
      if (!opponentData || !opponentData.userId) {
        console.warn(`Cannot find opponent data for socket ${opponent.id}`);
        return;
      }
      
      const opponentId = opponentData.userId;
      const opponentCharacter = opponentData.character || 'pink';
      
      console.log(`Creating game with players: ${userId} (${character}) and ${opponentId} (${opponentCharacter})`);
      
      // Create a new game
      const gameId = generateGameId();
      const game = new TriviaGame([userId, opponentId]);
      
      // Add character data to the game
      game.getGameState().players.forEach(player => {
        if (player.userId === userId) {
          player.character = character;
        } else if (player.userId === opponentId) {
          player.character = opponentCharacter;
        }
      });
      
      activeGames.set(gameId, game);
      
      // Update player connections
      playerConnections.set(userId, gameId);
      playerConnections.set(opponentId, gameId);
      
      // Remove both players from waiting room
      waitingPlayers.delete(socket.id);
      waitingPlayers.delete(opponent.id);
      
      socket.leave('waiting_room');
      opponent.leave('waiting_room');
      
      // Notify both players about the match with opponent usernames
      io.to(socket.id).emit('match_found', {
        gameId,
        message: 'Match found! Joining game...',
        opponent: {
          userId: opponentId,
          username: opponentId // Using userId as username for now
        }
      });
      
      io.to(opponent.id).emit('match_found', {
        gameId,
        message: 'Match found! Joining game...',
        opponent: {
          userId: userId,
          username: userId // Using userId as username for now
        }
      });
      
      // Log the created game and players
      console.log(`Game ${gameId} created with players: ${game.getPlayerIds().join(', ')}`);
    }
  });
}

// Handle player disconnect
function handleDisconnect(socket: Socket) {
  // Clean up waiting players
  const userData = waitingPlayers.get(socket.id);
  if (userData) {
    console.log(`Player ${userData.userId} disconnected from waiting room`);
    waitingPlayers.delete(socket.id);
    playerConnections.delete(userData.userId);
    return;
  }
  
  // Check if this player was in a game
  let playerGameId: string | null = null;
  let playerUserId: string | null = null;
  
  // Find the user ID for this socket
  for (const [id, gameId] of playerConnections.entries()) {
    if (gameId !== 'waiting_room') {
      // This is a player in a game, check if it's the disconnected socket
      const game = activeGames.get(gameId);
      if (game && game.getPlayerIds().includes(id)) {
        // This could be the disconnected player
        playerGameId = gameId;
        playerUserId = id;
        break;
      }
    }
  }
  
  if (playerGameId && playerUserId) {
    console.log(`Player ${playerUserId} disconnected from game ${playerGameId}`);
    
    // Inform other players in the game
    socket.to(playerGameId).emit('player_disconnected', {
      userId: playerUserId,
      message: 'Your opponent has disconnected from the game.'
    });
    
    // Clean up the game
    activeGames.delete(playerGameId);
    
    // Clean up player connections for all players in this game
    const game = activeGames.get(playerGameId);
    if (game) {
      game.getPlayerIds().forEach(id => playerConnections.delete(id));
    }
  }
}

// Keep track of question timers so we can clear them if all players answer
const questionTimers = new Map<string, ReturnType<typeof setTimeout>>(); // gameId -> timer

// Send the next question to all players in a game
function sendNextQuestion(io: Server, gameId: string) {
  const game = activeGames.get(gameId);
  if (game) {
    // Clear any existing timer for this game
    if (questionTimers.has(gameId)) {
      clearTimeout(questionTimers.get(gameId)!);
      questionTimers.delete(gameId);
    }
    
    console.log(`Sending question to game ${gameId}: Round ${game.getGameState().currentRound}`);
    const questionData = game.getCurrentQuestion();
    
    // Reset all player answers for this question
    const players = game.getGameState().players;
    for (const player of players) {
      player.currentAnswer = null;
      player.answeredAt = null;
      player.timeRemaining = null;
    }
    
    // Send the question to all players
    io.to(gameId).emit('new_question', questionData);
    
    // Set a timeout for this question - guaranteed full 20 seconds
    const timer = setTimeout(() => {
      console.log(`Time's up for game ${gameId}, round ${game.getGameState().currentRound}`);
      
      // If game still exists and some players haven't answered
      if (activeGames.has(gameId) && !game.allPlayersAnswered()) {
        game.timeUp();
        io.to(gameId).emit('time_up', { message: 'Time\'s up!' });
        
        // Get round results and apply damage
        const roundResults = game.getRoundResults();
        game.applyDamage();
        
        // Emit round results after time is up
        io.to(gameId).emit('round_results', roundResults);
        
        // Clean up this timer
        questionTimers.delete(gameId);
        
        // Move to next question after a delay
        setTimeout(() => {
          if (game.isGameOver()) {
            const finalResults = game.getFinalResults();
            io.to(gameId).emit('game_over', finalResults);
            
            // Update player stats in database
            updatePlayerStats(finalResults);
            
            // Clean up
            activeGames.delete(gameId);
            game.getPlayerIds().forEach(id => playerConnections.delete(id));
          } else {
            game.moveToNextQuestion();
            sendNextQuestion(io, gameId);
          }
        }, 5000);
      }
    }, 20000); // Exactly 20 seconds per question
    
    // Store the timer so we can clear it if all players answer before time's up
    questionTimers.set(gameId, timer);
  }
}

// Generate a unique game ID
function generateGameId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Update player stats when a game ends
async function updatePlayerStats(results: any): Promise<void> {
  try {
    console.log('Starting to update player stats with results:', JSON.stringify(results));
    
    // Try to import User model
    let User;
    try {
      User = require('./models/User').default;
    } catch (error) {
      console.log('User model not found, cannot update player stats');
      return;
    }
    
    // Check if we have players data
    if (!results || !results.players || !Array.isArray(results.players)) {
      console.error('Invalid game results, cannot update player stats');
      return;
    }
    
    // Determine winner (if no tie)
    const tie = results.tie === true;
    const winnerId = tie ? null : results.winner;
    console.log(`Game result - Tie: ${tie}, Winner: ${winnerId}`);
    console.log(`Players to update: ${results.players.length}`);
    
    // Update stats for each player
    for (const player of results.players) {
      try {
        const playerId = player.userId;
        const isWinner = playerId === winnerId;
        
        console.log(`Processing player ID: ${playerId} (Winner: ${isWinner})`);
        
        // Create update operation
        const updateOperation = {
          $inc: {
            gamesPlayed: 1,
            gamesWon: isWinner ? 1 : 0,
            gamesLost: isWinner ? 0 : 1,
            score: player.score || 0
          }
        };
        
        // Try to update by ID
        try {
          const updateResult = await User.findByIdAndUpdate(
            playerId,
            updateOperation,
            { new: true }
          );
          
          if (updateResult) {
            console.log(`Successfully updated stats for user ID ${playerId}:`);
            console.log(`- Games Played: ${updateResult.gamesPlayed}`);
            console.log(`- Games Won: ${updateResult.gamesWon}`);
            console.log(`- Games Lost: ${updateResult.gamesLost}`);
            console.log(`- Score: ${updateResult.score}`);
          } else {
            console.log(`Could not find user with ID ${playerId}`);
          }
        } catch (error) {
          console.error(`Error updating user with ID ${playerId}:`, error);
        }
      } catch (error) {
        console.error(`Error processing player ${player.userId}:`, error);
      }
    }
    
    console.log('Player stats update complete');
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}