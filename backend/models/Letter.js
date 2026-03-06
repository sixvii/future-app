const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Please provide a delivery date'],
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'read'],
      default: 'pending',
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    category: {
      type: String,
      enum: ['personal', 'professional', 'reminder', 'other'],
      default: 'personal',
    },
    emoji: {
      type: String,
      default: '📮',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
letterSchema.index({ sender: 1, deliveryDate: 1 });
letterSchema.index({ recipient: 1, deliveryDate: 1 });
letterSchema.index({ status: 1 });

// Virtual for time until delivery
letterSchema.virtual('timeUntilDelivery').get(function () {
  if (this.isDelivered) return 0;
  return Math.max(0, this.deliveryDate - Date.now());
});

module.exports = mongoose.model('Letter', letterSchema);
