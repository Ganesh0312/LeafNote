const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Subtopic = require('../models/Subtopic');
const QuestionAnswer = require('../models/QuestionAnswer');

// @desc    Get all public subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isPublic: true }).populate('createdBy', 'username email');
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subject with all topics by slug
// @route   GET /api/subjects/:slug
// @access  Public
const getSubjectBySlug = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug }).populate('createdBy', 'username email');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topics = await Topic.find({ subject: subject._id })
      .populate('createdBy', 'username email')
      .sort({ order: 1 });

    res.status(200).json({ subject, topics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const subject = await Subject.create({
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: req.user._id,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check user permission
    if (subject.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this subject' });
    }

    const { name, description, isPublic } = req.body;
    
    if (name) {
      subject.name = name;
      // Triggers slugify validate hook
      subject.slug = undefined;
    }
    if (description !== undefined) subject.description = description;
    if (isPublic !== undefined) subject.isPublic = isPublic;

    const updatedSubject = await subject.save();
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a subject (Cascade delete)
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check user permission
    if (subject.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this subject' });
    }

    // Find all topics under this subject
    const topics = await Topic.find({ subject: req.params.id });
    const topicIds = topics.map((t) => t._id);

    // Find all subtopics under those topics
    const subtopics = await Subtopic.find({ topic: { $in: topicIds } });
    const subtopicIds = subtopics.map((st) => st._id);

    // Delete all standalone Q&As under those subtopics
    await QuestionAnswer.deleteMany({ subtopic: { $in: subtopicIds } });

    // Delete all Subtopics under those Topics
    await Subtopic.deleteMany({ topic: { $in: topicIds } });

    // Delete all Topics under this Subject
    await Topic.deleteMany({ subject: req.params.id });

    // Delete Subject itself
    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Subject and all sub-entities deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  getSubjectBySlug,
  createSubject,
  updateSubject,
  deleteSubject,
};
