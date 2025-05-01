import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get random trivia questions
router.get('/questions', async (req, res) => {
  try {
    const amount = req.query.amount || 10;
    const category = req.query.category || '';
    const difficulty = req.query.difficulty || '';
    
    // Using Open Trivia Database API
    let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    
    if (category) {
      url += `&category=${category}`;
    }
    
    if (difficulty) {
      url += `&difficulty=${difficulty}`;
    }
    
    const response = await axios.get(url);
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
router.get('/categories', async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php');
    res.json(response.data.trivia_categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;