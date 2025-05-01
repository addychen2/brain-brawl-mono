"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketConnection = void 0;
const TriviaGame_1 = require("./models/TriviaGame");
// Store active games and player connections
const activeGames = new Map();
const playerConnections = new Map(); // userId -> gameId
const waitingPlayers = new Map(); // socketId -> userId
const setupSocketConnection = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        // Join waiting room to find an opponent
        socket.on('join_waiting_room', (userId) => {
            console.log(`User ${userId} joined waiting room`);
            // Store this player in the waiting room
            waitingPlayers.set(socket.id, userId);
            playerConnections.set(userId, 'waiting_room');
            
            console.log(`Current waiting players: ${Array.from(waitingPlayers.values()).join(', ')}`);
            
            socket.join('waiting_room');
            findMatch(socket, userId, io);
        });
        // Join specific game room
        socket.on('join_game', (data) => {
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
        socket.on('submit_answer', (data) => {
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
                        clearTimeout(questionTimers.get(gameId));
                        questionTimers.delete(gameId);
                    }
                    
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
                        }
                        else {
                            game.moveToNextQuestion();
                            sendNextQuestion(io, gameId);
                        }
                    }, 5000);
                }
            } catch (error) {
                console.error(`Error processing answer: ${error.message}`);
                socket.emit('answer_result', { 
                    isCorrect: false, 
                    pointsEarned: 0, 
                    error: error.message 
                });
            }
        });
        // Handle player rematch request
        socket.on('rematch_request', (data) => {
            const { gameId, userId } = data;
            const game = activeGames.get(gameId);
            if (game) {
                game.requestRematch(userId);
                // If all players want a rematch, create a new game
                if (game.allPlayersWantRematch()) {
                    const playerIds = game.getPlayerIds();
                    const newGame = new TriviaGame_1.TriviaGame(playerIds);
                    const newGameId = generateGameId();
                    activeGames.set(newGameId, newGame);
                    // Update player connections to point to new game
                    playerIds.forEach(id => playerConnections.set(id, newGameId));
                    // Inform players of new game
                    io.to(gameId).emit('rematch_created', {
                        newGameId,
                        message: 'All players accepted rematch. New game created!'
                    });
                }
                else {
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
exports.setupSocketConnection = setupSocketConnection;
// Find a match for a player in the waiting room
function findMatch(socket, userId, io) {
    // Get all sockets in waiting room
    io.in('waiting_room').fetchSockets().then(sockets => {
        // Filter out the current socket
        const availablePlayers = sockets.filter(s => s.id !== socket.id);
        
        // If there's at least one other player waiting
        if (availablePlayers.length > 0) {
            const opponent = availablePlayers[0];
            
            // Get the opponent's userId directly from our waiting players map
            const opponentId = waitingPlayers.get(opponent.id);
            
            if (!opponentId) {
                console.warn(`Cannot find opponent ID for socket ${opponent.id}`);
                return;
            }
            
            console.log(`Creating game with players: ${userId} and ${opponentId}`);
            
            // Create a new game
            const gameId = generateGameId();
            const game = new TriviaGame_1.TriviaGame([userId, opponentId]);
            activeGames.set(gameId, game);
            
            // Update player connections
            playerConnections.set(userId, gameId);
            playerConnections.set(opponentId, gameId);
            
            // Remove both players from waiting room
            waitingPlayers.delete(socket.id);
            waitingPlayers.delete(opponent.id);
            
            socket.leave('waiting_room');
            opponent.leave('waiting_room');
            
            // Notify both players about the match
            io.to(socket.id).to(opponent.id).emit('match_found', {
                gameId,
                message: 'Match found! Joining game...'
            });
            
            // Log the created game and players
            console.log(`Game ${gameId} created with players: ${game.getPlayerIds().join(', ')}`);
        }
    });
}
// Handle player disconnect
function handleDisconnect(socket) {
    // Clean up waiting players
    const userId = waitingPlayers.get(socket.id);
    if (userId) {
        console.log(`Player ${userId} disconnected from waiting room`);
        waitingPlayers.delete(socket.id);
        playerConnections.delete(userId);
        return;
    }
    
    // Check if this player was in a game
    let playerGameId = null;
    let playerUserId = null;
    
    // Find the user ID for this socket
    for (const [id, gameId] of playerConnections.entries()) {
        if (gameId !== 'waiting_room') {
            // This is a player in a game, check if it's the disconnected socket
            const game = activeGames.get(gameId);
            if (game && game.getPlayerIds().includes(id)) {
                // Check if this is the socket that disconnected
                // This is challenging without maintaining a socket-to-userId mapping
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
const questionTimers = new Map(); // gameId -> timer

// Send the next question to all players in a game
function sendNextQuestion(io, gameId) {
    const game = activeGames.get(gameId);
    if (game) {
        // Clear any existing timer for this game
        if (questionTimers.has(gameId)) {
            clearTimeout(questionTimers.get(gameId));
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
                
                // Emit round results after time is up
                io.to(gameId).emit('round_results', game.getRoundResults());
                
                // Clean up this timer
                questionTimers.delete(gameId);
                
                // Move to next question after a delay
                setTimeout(() => {
                    if (game.isGameOver()) {
                        io.to(gameId).emit('game_over', game.getFinalResults());
                        // Clean up
                        activeGames.delete(gameId);
                        game.getPlayerIds().forEach(id => playerConnections.delete(id));
                    }
                    else {
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
function generateGameId() {
    return Math.random().toString(36).substring(2, 9);
}