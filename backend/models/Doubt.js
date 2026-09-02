const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allows quick guest queries or authenticated users
    },
    questionText: {
      type: String,
      default: '',
    },
    hasImage: {
      type: Boolean,
      default: false,
    },
    subject: {
      type: String,
      default: 'General Reasoning / Aptitude',
    },
    solution: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doubt', doubtSchema);