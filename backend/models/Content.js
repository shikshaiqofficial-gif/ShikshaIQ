const mongoose = require('mongoose');

// Job Alert Schema
const jobAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true },
    category: {
      type: String,
      enum: ['SSC', 'Railways', 'Banking', 'UPSC', 'Defence', 'State PSC', 'Teaching'],
      required: true,
    },
    vacancies: { type: Number, required: true },
    qualification: { type: String, required: true },
    lastDate: { type: Date, required: true },
    salary: { type: String, default: 'As per norms' },
    applyUrl: { type: String, required: true },
    notificationPdfUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Daily Current Affairs Schema
const currentAffairsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    category: {
      type: String,
      enum: ['National', 'International', 'Economy', 'Science & Tech', 'Sports', 'Awards'],
      required: true,
    },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }],
    source: { type: String, default: 'PIB / The Hindu' },
    readTimeMinutes: { type: Number, default: 2 },
  },
  { timestamps: true }
);

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);
const CurrentAffairs = mongoose.model('CurrentAffairs', currentAffairsSchema);

module.exports = { JobAlert, CurrentAffairs };