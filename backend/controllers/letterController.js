const Letter = require('../models/Letter');
const User = require('../models/User');

// @desc    Create a new letter
// @route   POST /api/letters
// @access  Private
const createLetter = async (req, res) => {
  try {
    const { recipientPhone, title, message, deliveryDate, category, emoji } = req.body;

    if (!title || !message || !deliveryDate) {
      return res.status(400).json({ message: 'Title, message and delivery date are required' });
    }

    let recipientUser = req.user;
    if (recipientPhone && recipientPhone.trim() !== '') {
      recipientUser = await User.findOne({ phone: recipientPhone.trim() });
      if (!recipientUser) {
        return res.status(400).json({ message: 'Recipient must be a registered user' });
      }
    }

    const letter = await Letter.create({
      sender: req.user._id,
      recipient: recipientUser._id,
      title,
      message,
      deliveryDate,
      category,
      emoji,
    });

    const createdLetter = await Letter.findById(letter._id)
      .populate('sender', 'name phone')
      .populate('recipient', 'name phone');

    res.status(201).json(createdLetter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sent letters (user is sender)
// @route   GET /api/letters/sent
// @access  Private
const getSentLetters = async (req, res) => {
  try {
    const letters = await Letter.find({ sender: req.user._id })
      .populate('recipient', 'name phone')
      .sort({ deliveryDate: 1 });

    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get received letters (user is recipient)
// @route   GET /api/letters/received
// @access  Private
const getReceivedLetters = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const letters = await Letter.find({
      recipient: req.user._id,
      deliveryDate: { $lte: currentDate },
    })
      .populate('sender', 'name phone')
      .sort({ deliveryDate: -1 });

    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single letter by ID
// @route   GET /api/letters/:id
// @access  Private
const getLetterById = async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id)
      .populate('sender', 'name phone')
      .populate('recipient', 'name phone');

    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user is sender or recipient
    if (
      letter.sender._id.toString() !== req.user._id.toString() &&
      letter.recipient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this letter' });
    }

    // If user is recipient and letter is delivered, mark as read
    const hasReachedDelivery = new Date(letter.deliveryDate) <= new Date();
    if (hasReachedDelivery && !letter.isDelivered) {
      letter.isDelivered = true;
      letter.deliveredAt = new Date();
      letter.status = 'delivered';
    }

    if (letter.recipient._id.toString() === req.user._id.toString() && hasReachedDelivery && !letter.isRead) {
      letter.isRead = true;
      letter.readAt = Date.now();
      letter.status = 'read';
      await letter.save();
    } else if (hasReachedDelivery && !letter.isRead) {
      await letter.save();
    }

    res.json(letter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update letter (only before delivery)
// @route   PUT /api/letters/:id
// @access  Private
const updateLetter = async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);

    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user is the sender
    if (letter.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this letter' });
    }

    // Cannot update delivered letters
    if (new Date(letter.deliveryDate) <= new Date()) {
      return res.status(400).json({ message: 'Cannot update delivered letter' });
    }

    const { title, message, deliveryDate, category, emoji } = req.body;

    letter.title = title || letter.title;
    letter.message = message || letter.message;
    letter.deliveryDate = deliveryDate || letter.deliveryDate;
    letter.category = category || letter.category;
    letter.emoji = emoji || letter.emoji;

    const updatedLetter = await letter.save();
    res.json(updatedLetter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete letter (only before delivery)
// @route   DELETE /api/letters/:id
// @access  Private
const deleteLetter = async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);

    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user is the sender
    if (letter.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this letter' });
    }

    // Cannot delete delivered letters
    if (new Date(letter.deliveryDate) <= new Date()) {
      return res.status(400).json({ message: 'Cannot delete delivered letter' });
    }

    await letter.deleteOne();
    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process letter deliveries (called by cron job or server)
// @route   POST /api/letters/process-deliveries
// @access  Private (should be protected in production)
const processDeliveries = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const result = await Letter.updateMany(
      {
        deliveryDate: { $lte: currentDate },
        isDelivered: false,
      },
      {
        $set: {
          isDelivered: true,
          deliveredAt: currentDate,
          status: 'delivered',
        },
      }
    );

    res.json({
      message: 'Deliveries processed',
      delivered: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLetter,
  getSentLetters,
  getReceivedLetters,
  getLetterById,
  updateLetter,
  deleteLetter,
  processDeliveries,
};
