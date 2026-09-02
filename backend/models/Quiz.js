const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }, // 0, 1, 2, 3
  explanation: { type: String, default: '' },
  marks: { type: Number, default: 2 },
  negativeMarks: { type: Number, default: 0.5 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetExam: { type: String, default: 'All' },
    durationMinutes: { type: Number, default: 15 },
    totalQuestions: { type: Number, default: 5 },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const userAttemptSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    userId: { type: String, default: 'guest' },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    unattempted: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', userAttemptSchema);

module.exports = { Quiz, QuizAttempt };