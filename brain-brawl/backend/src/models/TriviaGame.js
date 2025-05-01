"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriviaGame = void 0;
class TriviaGame {
    constructor(playerIds) {
        this.questions = [];
        this.roundResults = [];
        this.gameState = {
            gameId: Math.random().toString(36).substring(2, 9),
            players: playerIds.map(id => ({
                userId: id,
                score: 0,
                currentAnswer: null,
                answeredAt: null,
                timeRemaining: null,
                wantsRematch: false
            })),
            currentRound: 0,
            totalRounds: 10, // Set number of rounds
            currentQuestion: null,
            status: 'waiting',
            startTime: null,
            endTime: null
        };
        // In a real implementation, you would fetch questions from an API
        // For now, we'll use placeholder questions
        this.questions = this.getPlaceholderQuestions();
    }
    getGameState() {
        // Return a copy to prevent external modification
        return Object.assign({}, this.gameState);
    }
    getPlayerIds() {
        return this.gameState.players.map(player => player.userId);
    }
    hasAllPlayers() {
        return this.gameState.players.length >= 2;
    }
    startGame() {
        this.gameState.status = 'active';
        this.gameState.startTime = Date.now();
        this.gameState.currentRound = 1;
        this.gameState.currentQuestion = this.questions[0];
    }
    getCurrentQuestion() {
        return {
            question: this.gameState.currentQuestion,
            round: this.gameState.currentRound,
            totalRounds: this.gameState.totalRounds
        };
    }
    submitAnswer(userId, answer, timeRemaining) {
        // Log the player ID to help debug
        console.log(`Submit answer from player: ${userId}`);
        console.log(`Current players: ${JSON.stringify(this.gameState.players.map(p => p.userId))}`);
        
        const playerIndex = this.gameState.players.findIndex(p => p.userId === userId);
        if (playerIndex === -1) {
            console.error(`Player not found: ${userId}`);
            // Instead of throwing error, return a result indicating player not found
            return { isCorrect: false, pointsEarned: 0, error: 'Player not found' };
        }
        
        const player = this.gameState.players[playerIndex];
        
        // If player already answered, don't overwrite their answer
        if (player.currentAnswer !== null) {
            console.log(`Player ${userId} already answered`);
            return { isCorrect: false, pointsEarned: 0, error: 'Already answered' };
        }
        
        const currentQuestion = this.gameState.currentQuestion;
        const isCorrect = answer === currentQuestion.correctAnswer;
        
        // Calculate points: base points + time bonus
        const basePoints = 100;
        const timeBonus = Math.floor(timeRemaining / 1000 * 5); // 5 points per second remaining
        const pointsEarned = isCorrect ? basePoints + timeBonus : 0;
        
        // Update player state
        player.currentAnswer = answer;
        player.answeredAt = Date.now();
        player.timeRemaining = timeRemaining;
        player.score += pointsEarned;
        
        console.log(`Player ${userId} answered ${isCorrect ? 'correctly' : 'incorrectly'}, earned ${pointsEarned} points`);
        
        return { isCorrect, pointsEarned };
    }
    shouldMoveToNextQuestion() {
        // Move to next if all players answered or time is up (handled externally)
        return this.allPlayersAnswered();
    }
    allPlayersAnswered() {
        return this.gameState.players.every(player => player.currentAnswer !== null);
    }
    moveToNextQuestion() {
        // Save current round results
        this.saveRoundResults();
        // Reset player answers for next question
        this.gameState.players.forEach(player => {
            player.currentAnswer = null;
            player.answeredAt = null;
            player.timeRemaining = null;
        });
        // Move to next round
        this.gameState.currentRound++;
        // Set next question or end game if all questions answered
        if (this.gameState.currentRound <= this.gameState.totalRounds) {
            this.gameState.currentQuestion = this.questions[this.gameState.currentRound - 1];
        }
        else {
            this.endGame();
        }
    }
    timeUp() {
        // Mark any unanswered questions
        this.gameState.players.forEach(player => {
            if (player.currentAnswer === null) {
                player.currentAnswer = '';
                player.timeRemaining = 0;
            }
        });
    }
    isGameOver() {
        return this.gameState.currentRound > this.gameState.totalRounds;
    }
    endGame() {
        this.gameState.status = 'completed';
        this.gameState.endTime = Date.now();
    }
    getRoundResults() {
        const question = this.gameState.currentQuestion;
        const playerResults = this.gameState.players.map(player => {
            const isCorrect = player.currentAnswer === question.correctAnswer;
            return {
                userId: player.userId,
                answer: player.currentAnswer,
                isCorrect,
                timeRemaining: player.timeRemaining,
                pointsEarned: isCorrect ? 100 + Math.floor((player.timeRemaining || 0) / 1000 * 5) : 0
            };
        });
        return {
            question,
            playerResults
        };
    }
    getFinalResults() {
        // Sort players by score
        const sortedPlayers = [...this.gameState.players].sort((a, b) => b.score - a.score);
        // Check if there's a tie for first place
        const tie = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score;
        return {
            players: sortedPlayers.map(p => ({ userId: p.userId, score: p.score })),
            winner: tie ? null : sortedPlayers[0].userId,
            tie
        };
    }
    requestRematch(userId) {
        const playerIndex = this.gameState.players.findIndex(p => p.userId === userId);
        if (playerIndex !== -1) {
            this.gameState.players[playerIndex].wantsRematch = true;
        }
    }
    allPlayersWantRematch() {
        return this.gameState.players.every(player => player.wantsRematch);
    }
    saveRoundResults() {
        this.roundResults.push(this.getRoundResults());
    }
    getPlaceholderQuestions() {
        // In a real implementation, you would fetch these from a trivia API
        return [
            {
                id: '1',
                question: 'What is the capital of France?',
                correctAnswer: 'Paris',
                incorrectAnswers: ['London', 'Berlin', 'Madrid'],
                category: 'Geography',
                difficulty: 'easy'
            },
            {
                id: '2',
                question: 'Which planet is known as the Red Planet?',
                correctAnswer: 'Mars',
                incorrectAnswers: ['Venus', 'Jupiter', 'Mercury'],
                category: 'Science',
                difficulty: 'easy'
            },
            {
                id: '3',
                question: 'Who painted the Mona Lisa?',
                correctAnswer: 'Leonardo da Vinci',
                incorrectAnswers: ['Pablo Picasso', 'Vincent van Gogh', 'Michelangelo'],
                category: 'Art',
                difficulty: 'easy'
            },
            {
                id: '4',
                question: 'What is the largest ocean on Earth?',
                correctAnswer: 'Pacific Ocean',
                incorrectAnswers: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
                category: 'Geography',
                difficulty: 'easy'
            },
            {
                id: '5',
                question: 'In which year did World War II end?',
                correctAnswer: '1945',
                incorrectAnswers: ['1939', '1941', '1950'],
                category: 'History',
                difficulty: 'medium'
            },
            {
                id: '6',
                question: 'Which element has the chemical symbol "O"?',
                correctAnswer: 'Oxygen',
                incorrectAnswers: ['Gold', 'Silver', 'Iron'],
                category: 'Science',
                difficulty: 'easy'
            },
            {
                id: '7',
                question: 'What is the capital of Japan?',
                correctAnswer: 'Tokyo',
                incorrectAnswers: ['Beijing', 'Seoul', 'Bangkok'],
                category: 'Geography',
                difficulty: 'easy'
            },
            {
                id: '8',
                question: 'Who wrote "Romeo and Juliet"?',
                correctAnswer: 'William Shakespeare',
                incorrectAnswers: ['Charles Dickens', 'Jane Austen', 'Mark Twain'],
                category: 'Literature',
                difficulty: 'easy'
            },
            {
                id: '9',
                question: 'What is the tallest mountain in the world?',
                correctAnswer: 'Mount Everest',
                incorrectAnswers: ['K2', 'Kangchenjunga', 'Makalu'],
                category: 'Geography',
                difficulty: 'easy'
            },
            {
                id: '10',
                question: 'Which country is known as the Land of the Rising Sun?',
                correctAnswer: 'Japan',
                incorrectAnswers: ['China', 'South Korea', 'Vietnam'],
                category: 'Geography',
                difficulty: 'easy'
            }
        ];
    }
}
exports.TriviaGame = TriviaGame;
