const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Subtopic = require('../models/Subtopic');
const QuestionAnswer = require('../models/QuestionAnswer');

// @desc    Get all topics for a specific subject
// @route   GET /api/topics/subject/:subjectId
// @access  Public
const getTopicsBySubject = async (req, res) => {
  try {
    const topics = await Topic.find({ subject: req.params.subjectId })
      .populate('createdBy', 'username email')
      .sort({ order: 1 });
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single topic with subtopics (by ID or Slug)
// @route   GET /api/topics/:idOrSlug
// @access  Public
const getTopicById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const topic = await Topic.findOne(query)
      .populate('createdBy', 'username email')
      .populate('subject');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const subtopicsList = await Subtopic.find({ topic: topic._id })
      .populate('createdBy', 'username email')
      .sort({ order: 1 });

    res.status(200).json({ topic, subtopics: subtopicsList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a topic
// @route   POST /api/topics
// @access  Private
const createTopic = async (req, res) => {
  try {
    const { title, description, subject, content, order } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Topic title and subject ID are required' });
    }

    const topic = await Topic.create({
      title,
      description,
      subject,
      content: content || '',
      order: order !== undefined ? order : 0,
      createdBy: req.user._id,
    });

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Private
const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check user permission
    if (topic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this topic' });
    }

    const { title, description, content, order } = req.body;

    if (title) {
      topic.title = title;
      topic.slug = undefined; // trigger validation slug regeneration
    }
    if (description !== undefined) topic.description = description;
    if (content !== undefined) topic.content = content;
    if (order !== undefined) topic.order = order;

    const updatedTopic = await topic.save();
    res.status(200).json(updatedTopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a topic (Cascade delete)
// @route   DELETE /api/topics/:id
// @access  Private
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Check user permission
    if (topic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this topic' });
    }

    const subtopics = await Subtopic.find({ topic: req.params.id });
    const subtopicIds = subtopics.map((st) => st._id);

    // Delete standalone Q&As under those subtopics
    await QuestionAnswer.deleteMany({ subtopic: { $in: subtopicIds } });

    // Delete all Subtopics under this Topic
    await Subtopic.deleteMany({ topic: req.params.id });

    // Delete Topic itself
    await Topic.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Topic and all subtopics deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
};
