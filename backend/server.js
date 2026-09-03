require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Stabilizes MongoDB Atlas SRV lookup

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shikshaiq_super_secret_jwt_key_2026';

// ----------------------------------------------------
// GEMINI SDK CLIENT INITIALIZATION
// ----------------------------------------------------
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
}

// ----------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// ----------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// ----------------------------------------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  targetExam: { type: String, default: 'SSC CGL' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const questionSchema = new mongoose.Schema({
  exam: { type: String, required: true, default: 'SSC CGL' },
  subject: { type: String, required: true },
  topic: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate' },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  marks: { type: Number, default: 2 },
  negativeMarks: { type: Number, default: 0.5 },
  explanation: { type: String, required: true },
  year: { type: Number, default: 2026 }
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

const dailyMockSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, index: true },
  exam: { type: String, default: 'SSC CGL' },
  totalQuestions: { type: Number, default: 100 },
  questions: [{
    _id: { type: String },
    exam: String,
    subject: String,
    topic: String,
    difficulty: String,
    questionText: String,
    options: [String],
    correctOptionIndex: Number,
    marks: { type: Number, default: 2 },
    negativeMarks: { type: Number, default: 0.5 },
    explanation: String
  }],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

dailyMockSchema.index({ dateKey: 1, exam: 1 }, { unique: true });
const DailyMock = mongoose.models.DailyMock || mongoose.model('DailyMock', dailyMockSchema);

const testSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  exam: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  attempted: { type: Number, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  timeTakenSeconds: { type: Number, default: 0 }
}, { timestamps: true });

const TestSubmission = mongoose.models.TestSubmission || mongoose.model('TestSubmission', testSubmissionSchema);

const currentAffairSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'National' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  summary: { type: String, required: true },
  keyTakeaways: [{ type: String }],
  source: { type: String, default: 'PIB / The Hindu' }
}, { timestamps: true });

const CurrentAffair = mongoose.models.CurrentAffair || mongoose.model('CurrentAffair', currentAffairSchema);

const jobAlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  vacancies: { type: String, default: 'Various' },
  qualification: { type: String, required: true },
  lastDate: { type: String, required: true },
  applyUrl: { type: String, required: true },
  category: { type: String, default: 'Central Govt' }
}, { timestamps: true });

const JobAlert = mongoose.models.JobAlert || mongoose.model('JobAlert', jobAlertSchema);

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

// ----------------------------------------------------
// RESILIENT GEMINI INVOCATION HELPER (gemini-3.6-flash)
// ----------------------------------------------------
async function invokeGeminiWithFallback(contents) {
  if (!process.env.GEMINI_API_KEY || !ai) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents
    });

    const outputText = response?.text ||
      response?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ||
      '';

    if (outputText) {
      return outputText;
    }
  } catch (err) {
    console.error('Gemini 3.6 Flash invocation error:', err.message);
    throw err;
  }

  throw new Error('No text generated by Gemini 3.6 Flash.');
}

// ----------------------------------------------------
// 100-QUESTION DAILY ENGINE (BATCH GENERATION & CACHING)
// ----------------------------------------------------
const SECTIONS_CONFIG = [
  {
    subject: 'Quantitative Aptitude',
    count: 25,
    topics: 'Algebra, Geometry, Trigonometry, Arithmetic, Mensuration, Data Interpretation'
  },
  {
    subject: 'General Intelligence & Reasoning',
    count: 25,
    topics: 'Syllogism, Analogy, Number Series, Coding-Decoding, Blood Relations, Venn Diagrams'
  },
  {
    subject: 'General Awareness',
    count: 25,
    topics: 'Indian Polity, Modern History, Geography, General Science, Current Static GK'
  },
  {
    subject: 'English Comprehension',
    count: 25,
    topics: 'Error Spotting, Cloze Test, Idioms & Phrases, Synonyms, Antonyms, Sentence Improvement'
  }
];

async function generateBatch(subject, count, topics, exam, dateKey) {
  if (!ai) return [];

  const prompt = `You are the Master Question Setter for Indian competitive exams (${exam}, RRB NTPC).
Generate exactly ${count} multiple-choice questions for ${subject}.
Key Focus Topics: ${topics}.
Randomization Seed / Date: ${dateKey}.

Requirements:
1. Difficulty mix: Easy, Moderate, and Hard questions.
2. Provide exactly 4 plausible, unambiguous options.
3. correctOptionIndex must be an integer from 0 to 3.
4. Marks: 2, Negative Marks: 0.5.
5. Provide an insightful pedagogical explanation or shortcut formula.

Return ONLY a valid JSON array matching this exact schema:
[
  {
    "exam": "${exam}",
    "subject": "${subject}",
    "topic": "Topic Name",
    "difficulty": "Moderate",
    "questionText": "Question statement here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "marks": 2,
    "negativeMarks": 0.5,
    "explanation": "Clear step-by-step solution"
  }
]

Return strictly raw JSON. Do NOT include markdown code blocks, backticks, or intro text.`;

  try {
    const rawOutput = await invokeGeminiWithFallback(prompt);
    let cleanText = rawOutput.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
    const arr = JSON.parse(cleanText);
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error(`Batch generation error for ${subject}:`, err.message);
    return [];
  }
}

async function getOrGenerate100DailyMock(exam = 'SSC CGL') {
  const todayKey = new Date().toISOString().split('T')[0];

  const existing = await DailyMock.findOne({ dateKey: todayKey, exam });
  if (existing && existing.questions?.length >= 95) {
    return existing;
  }

  console.log(`[AI Engine] Synthesizing 100-Question Daily Mock for ${todayKey} (${exam})...`);
  let questions = [];

  for (const sec of SECTIONS_CONFIG) {
    let secQuestions = [];

    if (ai) {
      const [batchA, batchB] = await Promise.all([
        generateBatch(sec.subject, 13, sec.topics, exam, `${todayKey}_A`),
        generateBatch(sec.subject, 12, sec.topics, exam, `${todayKey}_B`)
      ]);
      secQuestions = [...batchA, ...batchB];
    }

    if (secQuestions.length < sec.count) {
      const needed = sec.count - secQuestions.length;
      const dbSamples = await Question.find({ subject: sec.subject }).limit(needed);
      secQuestions = secQuestions.concat(dbSamples);
    }

    questions = questions.concat(secQuestions);
  }

  if (questions.length < 100) {
    const remaining = 100 - questions.length;
    const extra = await Question.find().limit(remaining);
    questions = questions.concat(extra);
  }

  const mappedQuestions = questions.slice(0, 100).map((q, idx) => ({
    _id: q._id ? q._id.toString() : `mock_${todayKey}_${idx + 1}`,
    exam: q.exam || exam,
    subject: q.subject || 'General Aptitude',
    topic: q.topic || 'Revision',
    difficulty: q.difficulty || 'Moderate',
    questionText: q.questionText,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex ?? 0,
    marks: q.marks || 2,
    negativeMarks: q.negativeMarks || 0.5,
    explanation: q.explanation || 'Refer to standard derivation.'
  }));

  const saved = await DailyMock.findOneAndUpdate(
    { dateKey: todayKey, exam },
    {
      dateKey: todayKey,
      exam,
      totalQuestions: mappedQuestions.length,
      questions: mappedQuestions,
      generatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  return saved;
}

// Scheduled Midnight Job (00:01 AM IST)
cron.schedule('1 0 * * *', async () => {
  if (ai) {
    console.log('[Cron] Initiating midnight 100-question mock generation...');
    try {
      await getOrGenerate100DailyMock('SSC CGL');
    } catch (err) {
      console.error('[Cron] Midnight generation error:', err);
    }
  }
});

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ShikshaIQ AI Engine & Mock Test Backend',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Daily 100-Question Mock Test
app.get('/api/tests/daily-100-mock', async (req, res) => {
  try {
    const { exam = 'SSC CGL', force = 'false' } = req.query;

    if (!process.env.GEMINI_API_KEY || !ai) {
      const dbFallback = await Question.find({ exam }).limit(100);
      return res.json({
        success: true,
        dateKey: new Date().toISOString().split('T')[0],
        totalQuestions: dbFallback.length,
        questions: dbFallback,
        source: 'database_fallback'
      });
    }

    if (force === 'true') {
      const todayKey = new Date().toISOString().split('T')[0];
      await DailyMock.deleteOne({ dateKey: todayKey, exam });
      console.log(`[AI Engine] Purged cache for ${todayKey} (${exam}) to force fresh generation.`);
    }

    const dailyTest = await getOrGenerate100DailyMock(exam);

    res.json({
      success: true,
      dateKey: dailyTest.dateKey,
      totalQuestions: dailyTest.questions.length,
      questions: dailyTest.questions,
      source: 'gemini_daily_cache'
    });
  } catch (error) {
    console.error('100-Question Mock retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve or generate daily 100-question test.'
    });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, targetExam } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      targetExam: targetExam || 'SSC CGL'
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        targetExam: newUser.targetExam
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetExam: user.targetExam
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user session.' });
  }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, targetExam } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (name) user.name = name.trim();
    if (targetExam) user.targetExam = targetExam;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetExam: user.targetExam
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user profile.' });
  }
});

// Questions Routes
app.get('/api/questions', async (req, res) => {
  try {
    const { exam, subject, difficulty, limit = 50 } = req.query;
    const filter = {};

    if (exam) filter.exam = exam;
    if (subject && subject !== 'All') filter.subject = subject;
    if (difficulty && difficulty !== 'Mixed') filter.difficulty = difficulty;

    const questions = await Question.find(filter).limit(parseInt(limit));
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    console.error('Questions fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to load test questions.' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const {
      exam,
      subject,
      topic,
      difficulty,
      questionText,
      options,
      correctOptionIndex,
      marks,
      negativeMarks,
      explanation
    } = req.body;

    if (!questionText || !options || correctOptionIndex === undefined || !explanation) {
      return res.status(400).json({ success: false, message: 'Missing required question fields.' });
    }

    const newQuestion = await Question.create({
      exam: exam || 'SSC CGL',
      subject: subject || 'Quantitative Aptitude',
      topic: topic || 'General',
      difficulty: difficulty || 'Moderate',
      questionText,
      options,
      correctOptionIndex,
      marks: marks || 2,
      negativeMarks: negativeMarks || 0.5,
      explanation
    });

    res.status(201).json({ success: true, question: newQuestion });
  } catch (error) {
    console.error('Question creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to add question.' });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
});

// Test Submission & Scoring Route
app.post('/api/tests/submit', verifyToken, async (req, res) => {
  try {
    const { exam, answers, timeTakenSeconds } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid submission answers format.' });
    }

    const questionIds = answers.map(a => a.questionId);
    let questionMap = new Map();

    const validMongoIds = questionIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validMongoIds.length > 0) {
      const dbQuestions = await Question.find({ _id: { $in: validMongoIds } });
      dbQuestions.forEach(q => questionMap.set(q._id.toString(), q));
    }

    const todayKey = new Date().toISOString().split('T')[0];
    const dailyMock = await DailyMock.findOne({ dateKey: todayKey });
    if (dailyMock) {
      dailyMock.questions.forEach(q => {
        if (!questionMap.has(q._id)) {
          questionMap.set(q._id, q);
        }
      });
    }

    let correct = 0;
    let incorrect = 0;
    let score = 0;
    let totalMarks = 0;

    answers.forEach(ans => {
      const q = questionMap.get(ans.questionId);
      if (q) {
        totalMarks += (q.marks || 2);
        if (ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined) {
          if (ans.selectedOptionIndex === q.correctOptionIndex) {
            correct++;
            score += (q.marks || 2);
          } else {
            incorrect++;
            score -= (q.negativeMarks || 0.5);
          }
        }
      }
    });

    const attempted = correct + incorrect;
    const finalScore = Math.max(0, parseFloat(score.toFixed(2)));
    const accuracy = attempted > 0 ? parseFloat(((correct / attempted) * 100).toFixed(1)) : 0;

    const submission = await TestSubmission.create({
      userId: req.user.id,
      userName: req.user.name || 'Candidate',
      exam: exam || 'SSC 100-Q Daily Mock',
      totalQuestions: answers.length,
      attempted,
      correct,
      incorrect,
      score: finalScore,
      totalMarks: totalMarks || answers.length * 2,
      accuracy,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    res.status(201).json({ success: true, result: submission });
  } catch (error) {
    console.error('Test submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to process test submission.' });
  }
});

// Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
  try {
    const submissions = await TestSubmission.find()
      .sort({ score: -1, accuracy: -1, timeTakenSeconds: 1 })
      .limit(50);

    if (submissions.length === 0) {
      return res.json({
        success: true,
        leaderboard: [
          { _id: '1', userName: 'Ananya Sharma', exam: 'SSC CGL', score: 184, totalMarks: 200, accuracy: 96, timeTakenSeconds: 3200 },
          { _id: '2', userName: 'Rahul Verma', exam: 'SSC CGL', score: 176, totalMarks: 200, accuracy: 92, timeTakenSeconds: 3450 }
        ]
      });
    }

    res.json({ success: true, leaderboard: submissions });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve leaderboard rankings.' });
  }
});

// Multimodal Doubt Solver
app.post('/api/doubts/solve', async (req, res) => {
  try {
    const { question, subject, imageBase64 } = req.body;

    if (!question && !imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a question description or an image diagram.'
      });
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in the environment variables.'
      });
    }

    const contents = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType
        }
      });
    }

    const promptText = `Subject Domain: ${subject || 'General Aptitude'}
You are ShikshaIQ's Master Exam Faculty for Indian competitive exams (SSC CGL, RRB NTPC, Banking).
Analyze the candidate's question and any visual diagram. Provide:
1. **Core Concept & Theorem**: Identify the fundamental rule.
2. **Step-by-Step Derivation**: Line-by-line calculation.
3. **Exam Shortcut / 30-Second Trick**: Fast solving technique for the actual exam.
4. **Final Answer**: Clearly state the correct option or value.

Candidate Question Statement:
${question || 'Solve the question shown in the attached image.'}`;

    contents.push(promptText);

    const solutionText = await invokeGeminiWithFallback(contents);
    res.json({ success: true, solution: solutionText });
  } catch (error) {
    console.error('Gemini doubt solve error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve doubt.'
    });
  }
});

// Study Plan Generator
app.post('/api/study-plan/generate', verifyToken, async (req, res) => {
  try {
    const { targetExam, weakSubjects, recentScore, accuracy } = req.body;

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `You are the lead academic mentor at ShikshaIQ.
Profile: Target Exam: ${targetExam || 'SSC CGL'}, Score: ${recentScore ?? 'N/A'}, Accuracy: ${accuracy ?? 'N/A'}%, Weak Areas: ${weakSubjects || 'Quantitative Aptitude, Reasoning'}

Return raw JSON only matching this schema:
{
  "focusSummary": "2-sentence diagnosis",
  "days": [
    {
      "day": "Day 1",
      "subject": "Quantitative Aptitude",
      "topic": "Algebra",
      "targetQuestions": 35,
      "strategyTip": "Formula shortcut trick"
    }
  ]
}`;

    const rawOutput = await invokeGeminiWithFallback(prompt);
    let cleanText = rawOutput.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
    res.json({ success: true, plan: JSON.parse(cleanText) });
  } catch (error) {
    console.error('Study plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate study plan.' });
  }
});

// Current Affairs & Jobs
app.get('/api/current-affairs', async (req, res) => {
  try {
    const items = await CurrentAffair.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, capsules: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch current affairs.' });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await JobAlert.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch jobs.' });
  }
});

// ----------------------------------------------------
// DATABASE & SERVER INITIALIZATION
// ----------------------------------------------------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI environment variable is missing.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connection established successfully.');
    app.listen(PORT, () => {
      console.log(`ShikshaIQ backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Atlas connection failed:', err);
    process.exit(1);
  });