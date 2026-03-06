const express = require('express');
const router = express.Router();
const {
  createLetter,
  getSentLetters,
  getReceivedLetters,
  getLetterById,
  updateLetter,
  deleteLetter,
  processDeliveries,
} = require('../controllers/letterController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createLetter);
router.get('/sent', protect, getSentLetters);
router.get('/received', protect, getReceivedLetters);
router.post('/process-deliveries', processDeliveries);
router.get('/:id', protect, getLetterById);
router.put('/:id', protect, updateLetter);
router.delete('/:id', protect, deleteLetter);

module.exports = router;
