"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
// Replace this with your fixed questions URL
const QUESTIONS_URL = 'https://opentdb.com/api.php?amount=50&category=9&type=multiple';

// Get trivia questions
router.get('/questions', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(QUESTIONS_URL);
        const data = response.data;
        if (data.response_code === 0) {
            // Format questions for our application
            const formattedQuestions = data.results.map((q, index) => ({
                id: index.toString(),
                question: q.question,
                correctAnswer: q.correct_answer,
                incorrectAnswers: q.incorrect_answers,
                category: q.category,
                difficulty: q.difficulty
            }));
            res.json(formattedQuestions);
        }
        else {
            res.status(400).json({ message: 'Failed to fetch questions' });
        }
    }
    catch (error) {
        console.error('Error fetching trivia questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get trivia categories
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://opentdb.com/api_category.php');
        res.json(response.data.trivia_categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
