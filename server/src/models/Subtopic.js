const mongoose = require('mongoose');
const slugify = require('slugify');

const SubtopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtopic title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
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

// Auto-generate slug before validation
SubtopicSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Subtopic', SubtopicSchema);
