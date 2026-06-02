const mongoose = require('mongoose');
const Subtopic = require('../models/Subtopic');
const QuestionAnswer = require('../models/QuestionAnswer');

// @desc    Get all subtopics for a specific topic
// @route   GET /api/subtopics/topic/:topicId
// @access  Public
const getSubtopicsByTopic = async (req, res) => {
  try {
    const subtopics = await Subtopic.find({ topic: req.params.topicId })
      .populate('createdBy', 'username email')
      .sort({ order: 1 });
    res.status(200).json(subtopics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single subtopic details by ID or Slug (including standalone Q&As)
// @route   GET /api/subtopics/:idOrSlug
// @access  Public
const getSubtopicById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const subtopic = await Subtopic.findOne(query)
      .populate('createdBy', 'username email')
      .populate({
        path: 'topic',
        populate: {
          path: 'subject',
        },
      });

    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }

    // Retrieve standalone Q&As
    const qas = await QuestionAnswer.find({ subtopic: subtopic._id })
      .populate('createdBy', 'username email')
      .sort({ order: 1 });

    res.status(200).json({
      ...subtopic.toObject(),
      qas,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a subtopic
// @route   POST /api/subtopics
// @access  Private
const createSubtopic = async (req, res) => {
  try {
    const { title, topic, content, order } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ message: 'Subtopic title and topic ID are required' });
    }

    const subtopic = await Subtopic.create({
      title,
      topic,
      content: content || '',
      order: order !== undefined ? order : 0,
      createdBy: req.user._id,
    });

    res.status(201).json(subtopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a subtopic (title, content, order)
// @route   PUT /api/subtopics/:id
// @access  Private
const updateSubtopic = async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id);

    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }

    // Check user permission
    if (subtopic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(455).json({ message: 'User not authorized to update this subtopic' });
    }

    const { title, content, order } = req.body;

    if (title) {
      subtopic.title = title;
      subtopic.slug = undefined; // trigger validation slug regeneration
    }
    if (content !== undefined) subtopic.content = content;
    if (order !== undefined) subtopic.order = order;

    const updatedSubtopic = await subtopic.save();

    // Fetch standalone Q&As to return unified payload
    const qas = await QuestionAnswer.find({ subtopic: updatedSubtopic._id })
      .populate('createdBy', 'username email')
      .sort({ order: 1 });

    res.status(200).json({
      ...updatedSubtopic.toObject(),
      qas,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a subtopic (Cascade delete Q&As)
// @route   DELETE /api/subtopics/:id
// @access  Private
const deleteSubtopic = async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id);

    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }

    // Check user permission
    if (subtopic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this subtopic' });
    }

    // Delete related Q&As first
    await QuestionAnswer.deleteMany({ subtopic: req.params.id });

    // Delete subtopic
    await Subtopic.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Subtopic and associated Q&As deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubtopicsByTopic,
  getSubtopicById,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
};
