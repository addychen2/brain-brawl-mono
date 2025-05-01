import { Server, Socket } from 'socket.io';
import { TriviaGame } from './models/TriviaGame';

// Store active games and player connections
const activeGames = new Map<string, TriviaGame>();
const playerConnections = new Map<string, string>(); // userId -> gameId

export const setupSocketConnection = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join waiting room to find an opponent
    socket.on('join_waiting_room', (userId: string) => {
      console.log(`User ${userId} joined waiting room`);
      socket.join('waiting_room');
      findMatch(socket, userId, io);
    });

    // Join specific game room
    socket.on('join_game', (data: { gameId: string, userId: string }) => {
      const { gameId, userId } = data;
      console.log(`User ${userId} joined game ${gameId}`);
      
      // Associate this user with this game
      playerConnections.set(userId, gameId);
      
      // Add the socket to the game's room
      socket.join(gameId);
      
      // Check if game exists
      const game = activeGames.get(gameId);
      if (game) {
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
      
      if (game) {
        const result = game.submitAnswer(userId, answer, timeRemaining);
        
        // Send result to the player who submitted
        socket.emit('answer_result', result);
        
        // If all players have answered or time is up, move to next question
        if (game.shouldMoveToNextQuestion()) {
          // First emit the round results to all players
          io.to(gameId).emit('round_results', game.getRoundResults());
          
          // Wait a few seconds before moving to next question
          setTimeout(() => {
            // If game is over, send final results
            if (game.isGameOver()) {
              io.to(gameId).emit('game_over', game.getFinalResults());
              // Clean up the game
              activeGames.delete(gameId);
              game.getPlayerIds().forEach(id => playerConnections.delete(id));
            } else {
              game.moveToNextQuestion();
              sendNextQuestion(io, gameId);
            }
          }, 5000);
        }
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
  });
};

// Find a match for a player in the waiting room
function findMatch(socket: Socket, userId: string, io: Server) {
  // Get all sockets in waiting room
  io.in('waiting_room').fetchSockets().then(sockets => {
    // Filter out the current socket
    const availablePlayers = sockets.filter(s => s.id !== socket.id);
    
    // If there's at least one other player waiting
    if (availablePlayers.length > 0) {
      const opponent = availablePlayers[0];
      const opponentId = opponent.data.userId; // Assuming userId is stored in socket data
      
      // Create a new game
      const gameId = generateGameId();
      const game = new TriviaGame([userId, opponentId]);
      activeGames.set(gameId, game);
      
      // Remove both players from waiting room
      socket.leave('waiting_room');
      opponent.leave('waiting_room');
      
      // Notify both players about the match
      io.to(socket.id).to(opponent.id).emit('match_found', {
        gameId,
        message: 'Match found! Joining game...'
      });
    }
  });
}

// Handle player disconnect
function handleDisconnect(socket: Socket) {
  // Cleanup logic here
  // For example, inform opponents if a player disconnects during a game
}

// Send the next question to all players in a game
function sendNextQuestion(io: Server, gameId: string) {
  const game = activeGames.get(gameId);
  if (game) {
    const questionData = game.getCurrentQuestion();
    io.to(gameId).emit('new_question', questionData);
    
    // Set a timeout for this question
    setTimeout(() => {
      // If game still exists and some players haven't answered
      if (activeGames.has(gameId) && !game.allPlayersAnswered()) {
        game.timeUp();
        io.to(gameId).emit('time_up', { message: 'Time\'s up!' });
        
        // Emit round results after time is up
        io.to(gameId).emit('round_results', game.getRoundResults());
        
        // Move to next question after a delay
        setTimeout(() => {
          if (game.isGameOver()) {
            io.to(gameId).emit('game_over', game.getFinalResults());
            // Clean up
            activeGames.delete(gameId);
            game.getPlayerIds().forEach(id => playerConnections.delete(id));
          } else {
            game.moveToNextQuestion();
            sendNextQuestion(io, gameId);
          }
        }, 5000);
      }
    }, 20000); // 20 seconds per question
  }
}

// Generate a unique game ID
function generateGameId(): string {
  return Math.random().toString(36).substring(2, 9);
}