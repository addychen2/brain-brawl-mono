import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Replace with fixed URL for more variety of questions
const QUESTIONS_URL = 'https://opentdb.com/api.php?amount=50&category=9&type=multiple';

// Get trivia questions
router.get('/questions', async function(_req: Request, res: Response) {
  try {
    const response = await axios.get(QUESTIONS_URL);
    const data = response.data;
    
    if (data.response_code === 0) {
      // Format questions for our application
      const formattedQuestions = data.results.map((q: any, index: number) => ({
        id: index.toString(),
        question: q.question,
        correctAnswer: q.correct_answer,
        incorrectAnswers: q.incorrect_answers,
        category: q.category,
        difficulty: q.difficulty
      }));
      
      res.json(formattedQuestions);
    } else {
      res.status(400).json({ message: 'Failed to fetch questions' });
    }
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trivia categories
router.get('/categories', async function(req: Request, res: Response) {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php');
    res.json(response.data.trivia_categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;