const QuestionAnswer = require('../models/QuestionAnswer');

// @desc    Get all Q&A for a subtopic
// @route   GET /api/qna/subtopic/:subtopicId
// @access  Public
const getQasBySubtopic = async (req, res) => {
  try {
    const qas = await QuestionAnswer.find({ subtopic: req.params.subtopicId })
      .populate('createdBy', 'username email')
      .sort({ order: 1 });
    res.status(200).json(qas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single Q&A
// @route   GET /api/qna/:id
// @access  Public
const getQaById = async (req, res) => {
  try {
    const qa = await QuestionAnswer.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!qa) {
      return res.status(404).json({ message: 'Q&A not found' });
    }

    res.status(200).json(qa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a Q&A
// @route   POST /api/qna
// @access  Private
const createQa = async (req, res) => {
  try {
    const { question, answer, subtopic, topic, tags, order } = req.body;

    if (!question || !answer || !subtopic) {
      return res.status(400).json({ message: 'Question, answer, and subtopic ID are required' });
    }

    const qa = await QuestionAnswer.create({
      question,
      answer,
      subtopic,
      topic,
      tags: tags || [],
      order: order !== undefined ? order : 0,
      createdBy: req.user._id,
    });

    res.status(201).json(qa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Q&A
// @route   PUT /api/qna/:id
// @access  Private
const updateQa = async (req, res) => {
  try {
    const qa = await QuestionAnswer.findById(req.params.id);

    if (!qa) {
      return res.status(404).json({ message: 'Q&A not found' });
    }

    // Check user permission
    if (qa.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this Q&A' });
    }

    const { question, answer, tags, order } = req.body;

    if (question !== undefined) qa.question = question;
    if (answer !== undefined) qa.answer = answer;
    if (tags !== undefined) qa.tags = tags;
    if (order !== undefined) qa.order = order;

    const updatedQa = await qa.save();
    res.status(200).json(updatedQa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Q&A
// @route   DELETE /api/qna/:id
// @access  Private
const deleteQa = async (req, res) => {
  try {
    const qa = await QuestionAnswer.findById(req.params.id);

    if (!qa) {
      return res.status(404).json({ message: 'Q&A not found' });
    }

    // Check user permission
    if (qa.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this Q&A' });
    }

    await QuestionAnswer.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: 'Q&A deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQasBySubtopic,
  getQaById,
  createQa,
  updateQa,
  deleteQa,
};
