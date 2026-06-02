const mongoose = require('mongoose');

const QuestionAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    subtopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subtopic',
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search performance
QuestionAnswerSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('QuestionAnswer', QuestionAnswerSchema);
