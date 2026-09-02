const express = require('express');
const Result = require('../models/Result');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Save test score (Protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { score, totalQuestions } = req.body;
    const userId = req.user.id || req.user.userId;

    if (score === undefined || !totalQuestions) {
      return res.status(400).json({ message: 'Score and total questions are required.' });
    }

    const percentage = Number(((score / totalQuestions) * 100).toFixed(1));

    const newResult = new Result({
      user: userId,
      score,
      totalQuestions,
      percentage,
    });

    await newResult.save();
    res.status(201).json(newResult);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save test result' });
  }
});

// Get user test history (Protected)
router.get('/my-results', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const results = await Result.find({ user: userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test results' });
  }
});

module.exports = router;