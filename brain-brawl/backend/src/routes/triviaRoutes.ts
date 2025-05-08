import express from 'express';
import axios from 'axios';

const router = express.Router();

// Replace this with your fixed questions URL
const QUESTIONS_URL = 'https://opentdb.com/api.php?amount=50&category=9&type=multiple';

router.get('/questions', async (_req, res) => {
  try {
    const response = await axios.get(QUESTIONS_URL);
    const data = response.data;

    if (data.response_code === 0) {
      const formattedQuestions = data.results.map((q: any, index: number) => ({
        id: index.toString(),
        question: q.question,
        correctAnswer: q.correct_answer,
        incorrectAnswers: q.incorrect_answers,
        // drop or keep as you like:
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


export default router;
