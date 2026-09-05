require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Stabilizes MongoDB Atlas SRV lookup

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
// HTTP SERVER & SOCKET.IO SETUP
// ----------------------------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  exam: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  attempted: { type: Number, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  timeTakenSeconds: { type: Number, default: 0 },
  questionAnalytics: [{
    questionId: String,
    subject: String,
    timeSpentSeconds: Number,
    isCorrect: Boolean,
    status: { type: String, enum: ['correct', 'incorrect', 'unattempted'] }
  }]
}, { timestamps: true });

const TestSubmission = mongoose.models.TestSubmission || mongoose.model('TestSubmission', testSubmissionSchema);

const challengeSchema = new mongoose.Schema({
  challengeCode: { type: String, required: true, unique: true, index: true },
  subject: { type: String, default: 'Mixed General Aptitude' },
  questions: [{
    _id: String,
    subject: String,
    questionText: String,
    options: [String],
    correctOptionIndex: Number,
    marks: { type: Number, default: 2 },
    negativeMarks: { type: Number, default: 0.5 },
    explanation: String
  }],
  creator: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    score: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    timeTakenSeconds: { type: Number, default: null },
    submittedAt: { type: Date, default: null }
  },
  opponent: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: null },
    score: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    timeTakenSeconds: { type: Number, default: null },
    submittedAt: { type: Date, default: null }
  },
  winner: { type: String, default: null },
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' }
}, { timestamps: true });

const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);

const currentAffairSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['National', 'International', 'Economy', 'Science & Tech', 'Sports'], default: 'National' },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
  summary: { type: String, required: true },
  bulletPoints: [{ type: String }],
  quiz: [{
    questionText: String,
    options: [String],
    correctOptionIndex: Number,
    explanation: String
  }],
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

const mistakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questionId: String,
  subject: String,
  topic: String,
  questionText: String,
  options: [String],
  correctOptionIndex: Number,
  explanation: String,
  failedIn: { type: String, default: 'Mock Test' }
}, { timestamps: true });

const Mistake = mongoose.models.Mistake || mongoose.model('Mistake', mistakeSchema);

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
// RESILIENT GEMINI INVOCATION HELPER
// ----------------------------------------------------
async function invokeGeminiWithFallback(contents) {
  if (!process.env.GEMINI_API_KEY || !ai) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  try {
   const response = await ai.models.generateContent({
  model: 'gemini-3.5-flash',
  contents: contents
    });

    const outputText = response?.text ||
      response?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ||
      '';

    if (outputText) {
      return outputText;
    }
  } catch (err) {
    console.error('Gemini invocation error:', err.message);
    throw err;
  }

  throw new Error('No text generated by Gemini.');
}

/// ----------------------------------------------------
// HIGH-VOLUME AUTOMATED GEMINI CURRENT AFFAIRS GENERATOR (50 CAPSULES & QUIZ Qs)
// ----------------------------------------------------
async function generateDailyAffairsWithGemini() {
  if (!ai) return;
  try {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const countToday = await CurrentAffair.countDocuments({ date: todayStr });
    
    // If we already have 50 items for today, skip generation
    if (countToday >= 50) {
      console.log('[AI Engine] Daily quota of 50 current affairs already met for today.');
      return;
    }

    console.log('[AI Engine] Synthesizing high-volume batch of 50 current affairs capsules & quiz questions via Gemini...');
    
    const prompt = `Generate exactly 10 distinct, high-yield current affairs exam capsules for competitive exams (SSC CGL, Banking IBPS, Railways NTPC) for date ${todayStr}. 
(Note: Generate batches across multiple calls or provide a dense, comprehensive set of 10 major detailed items covering National, International, Economy, Science & Tech, and Sports with extensive bullet points and multi-layered quiz questions).
Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "title": "String",
    "category": "National",
    "date": "${todayStr}",
    "summary": "Detailed summary paragraph...",
    "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
    "quiz": [
      {
        "questionText": "Question string?",
        "options": ["A", "B", "C", "D"],
        "correctOptionIndex": 0,
        "explanation": "Explanation string"
      }
    ]
  }
]
Return strictly raw JSON without backticks, markdown code blocks, or preamble text.`;

    // We can loop or execute a high-capacity request to reach robust volumes
    for (let batch = 0; batch < 5; batch++) { // Generates 5 batches of 10 = 50 total capsules
      const rawOutput = await invokeGeminiWithFallback(prompt);
      let cleanText = rawOutput.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
      const capsules = JSON.parse(cleanText);

      if (Array.isArray(capsules)) {
        for (const cap of capsules) {
          const exists = await CurrentAffair.findOne({ title: cap.title });
          if (!exists) {
            await CurrentAffair.create(cap);
          }
        }
      }
    }
    console.log('Successfully generated and stored 50 daily current affairs capsules & daily questions!');
  } catch (err) {
    console.error('Failed to auto-generate high-volume daily current affairs:', err.message);
  }
}

// ----------------------------------------------------
// AUTOMATED ALL-INDIA GOVERNMENT JOB ALERTS SCRAPER
// ----------------------------------------------------
async function generateDailyJobsWithGemini() {
  if (!ai) return;
  try {
    console.log('[AI Engine] Scanning live web for all active government & public sector jobs in India...');
    
    const prompt = `Search the live web for current active government and public sector job notifications across India right now in September 2026.
Cover a diverse mix of sectors: 
1. Central Govt / SSC
2. Banking & Insurance (IBPS, SBI, RBI)
3. Railways (RRB NTPC, ALP, Group D)
4. UPSC & Civil Services
5. Defence (CDS, NDA, Agniveer)
6. PSU & Engineering (GATE, ONGC, BHEL, NTPC)
7. State PSC & Teaching (CTET, State Police/Teacher boards)

Generate 10 distinct, active recruitment notifications with real details.
Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "title": "Exact Job Notification Title",
    "organization": "Recruiting Body Name",
    "vacancies": "e.g., 5,420 Posts or Various",
    "qualification": "e.g., 10th / 12th / Graduate / B.Tech",
    "lastDate": "e.g., 30 September 2026",
    "applyUrl": "[https://official-website.gov.in](https://official-website.gov.in)",
    "category": "Central Govt" 
  }
]
Note: Category must be one of: ['Central Govt', 'Banking', 'Railways', 'UPSC', 'Defence', 'PSU', 'State PSC'].
Return strictly raw JSON without backticks, markdown fences, or extra text.`;

    const rawOutput = await invokeGeminiWithFallback(prompt);
    let cleanText = rawOutput.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
    const jobs = JSON.parse(cleanText);

    if (Array.isArray(jobs)) {
      for (const job of jobs) {
        const exists = await JobAlert.findOne({ title: job.title });
        if (!exists) {
          await JobAlert.create(job);
        }
      }
      console.log('Successfully auto-populated pan-India government job alerts!');
    }
  } catch (err) {
    console.error('Failed to auto-generate all-India job alerts:', err.message);
  }
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

// Midnight Cron Job (00:01 AM)
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
// REAL-TIME WEBSOCKET (SOCKET.IO) BATTLE ENGINE
// ----------------------------------------------------
const liveRooms = new Map();

io.on('connection', (socket) => {
  socket.on('join_battle', ({ roomId, playerName }) => {
    socket.join(roomId);
    if (!liveRooms.has(roomId)) {
      liveRooms.set(roomId, { players: {} });
    }

    const room = liveRooms.get(roomId);
    room.players[socket.id] = {
      id: socket.id,
      name: playerName || 'Challenger',
      currentQ: 0,
      score: 0,
      finished: false
    };

    io.to(roomId).emit('room_update', {
      players: Object.values(room.players)
    });
  });

  socket.on('update_progress', ({ roomId, currentQ, score }) => {
    const room = liveRooms.get(roomId);
    if (room && room.players[socket.id]) {
      room.players[socket.id].currentQ = currentQ;
      room.players[socket.id].score = score;
      io.to(roomId).emit('progress_update', {
        players: Object.values(room.players)
      });
    }
  });

  socket.on('player_finished', ({ roomId, finalScore, timeTakenSeconds }) => {
    const room = liveRooms.get(roomId);
    if (room && room.players[socket.id]) {
      room.players[socket.id].finished = true;
      room.players[socket.id].score = finalScore;
      room.players[socket.id].timeTakenSeconds = timeTakenSeconds;

      const playerList = Object.values(room.players);
      const allDone = playerList.length >= 2 && playerList.every((p) => p.finished);

      io.to(roomId).emit('player_finished_broadcast', {
        players: playerList,
        battleOver: allDone
      });
    }
  });

  socket.on('disconnect', () => {
    liveRooms.forEach((room, roomId) => {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        io.to(roomId).emit('room_update', {
          players: Object.values(room.players)
        });
      }
    });
  });
});

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ShikshaIQ AI Engine & Live Mock Test Backend',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

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

// Authentication Routes
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

// Single Question Endpoints
app.get('/api/questions', async (req, res) => {
  try {
    const { exam, subject, difficulty, limit = 50 } = req.query;
    const filter = {};

    if (exam) filter.exam = exam;
    if (subject && subject !== 'All') filter.subject = subject;
    if (difficulty && difficulty !== 'Mixed') filter.difficulty = difficulty;

    const questions = await Question.find(filter).limit(parseInt(limit, 10));
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

app.post('/api/questions/bulk', async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payload must include a non-empty array of questions.'
      });
    }

    const formattedQuestions = questions.map((q) => ({
      exam: q.exam || 'SSC CGL',
      subject: q.subject || 'Quantitative Aptitude',
      topic: q.topic || 'General',
      difficulty: q.difficulty || 'Moderate',
      questionText: q.questionText,
      options: Array.isArray(q.options) ? q.options : [q.optionA, q.optionB, q.optionC, q.optionD],
      correctOptionIndex: Number(q.correctOptionIndex ?? 0),
      marks: Number(q.marks || 2),
      negativeMarks: Number(q.negativeMarks || 0.5),
      explanation: q.explanation || 'Refer to standard derivation.',
      year: Number(q.year || 2026)
    }));

    const inserted = await Question.insertMany(formattedQuestions, { ordered: false });

    res.status(201).json({
      success: true,
      count: inserted.length,
      message: `Successfully imported ${inserted.length} questions.`
    });
  } catch (error) {
    console.error('Bulk question import error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to bulk import questions.'
    });
  }
});

app.get('/api/questions/custom-quiz', async (req, res) => {
  try {
    const { subject, topic, count = 10, difficulty } = req.query;
    const sampleSize = Math.min(parseInt(count, 10) || 10, 50);

    const matchStage = {};
    if (subject && subject !== 'All') matchStage.subject = subject;
    if (topic && topic !== 'All') matchStage.topic = topic;
    if (difficulty && difficulty !== 'Mixed') matchStage.difficulty = difficulty;

    let questions = await Question.aggregate([
      { $match: matchStage },
      { $sample: { size: sampleSize } }
    ]);

    if (questions.length < sampleSize && subject && subject !== 'All') {
      const fallbackQuestions = await Question.aggregate([
        { $match: { subject } },
        { $sample: { size: sampleSize } }
      ]);
      questions = fallbackQuestions;
    }

    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Custom quiz fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate custom quiz.' });
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

// Mistake Vault Endpoints
app.get('/api/user/mistakes', verifyToken, async (req, res) => {
  try {
    const mistakes = await Mistake.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: mistakes.length, mistakes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve mistake vault.' });
  }
});

app.delete('/api/user/mistakes/:id', verifyToken, async (req, res) => {
  try {
    await Mistake.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: 'Mistake marked as mastered.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete mistake record.' });
  }
});

// 1V1 Peer Battle Endpoints
app.post('/api/challenges/create', async (req, res) => {
  try {
    const { subject = 'All' } = req.body;
    let userId = null;
    let userName = 'Challenger Aspirant';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.id;
        userName = decoded.name || userName;
      } catch (e) {}
    }

    const matchStage = (subject && subject !== 'All') ? { subject } : {};

    let sampledQuestions = await Question.aggregate([
      { $match: matchStage },
      { $sample: { size: 10 } }
    ]);

    if (!sampledQuestions || sampledQuestions.length < 10) {
      sampledQuestions = await Question.aggregate([{ $sample: { size: 10 } }]);
    }

    if (!sampledQuestions || sampledQuestions.length === 0) {
      sampledQuestions = [
        {
          _id: 'seed_q1',
          subject: 'Quantitative Aptitude',
          questionText: 'If x + 1/x = 5, what is the value of x² + 1/x²?',
          options: ['23', '25', '27', '21'],
          correctOptionIndex: 0,
          marks: 2,
          negativeMarks: 0.5,
          explanation: 'x² + 1/x² = 5² - 2 = 23.'
        }
      ];
    }

    const challengeCode = 'BATTLE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newChallenge = await Challenge.create({
      challengeCode,
      subject,
      questions: sampledQuestions,
      creator: {
        userId,
        name: userName
      },
      status: 'waiting'
    });

    res.status(201).json({ success: true, challenge: newChallenge });
  } catch (err) {
    console.error('Challenge creation error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create battle.' });
  }
});

app.get('/api/challenges/:code', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ challengeCode: req.params.code });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge battle not found.' });
    }
    res.json({ success: true, challenge });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve challenge details.' });
  }
});

app.post('/api/challenges/:code/submit', async (req, res) => {
  try {
    const { answers, timeTakenSeconds } = req.body;
    const challenge = await Challenge.findOne({ challengeCode: req.params.code });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Battle not found.' });
    }

    let currentUserId = null;
    let currentUserName = 'Gladiator Peer';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        currentUserId = decoded.id;
        currentUserName = decoded.name || currentUserName;
      } catch (e) {}
    }

    let correct = 0;
    let incorrect = 0;
    let score = 0;

    challenge.questions.forEach((q) => {
      const selected = answers[q._id];
      if (selected !== undefined && selected !== null) {
        if (selected === q.correctOptionIndex) {
          correct++;
          score += 2;
        } else {
          incorrect++;
          score -= 0.5;
        }
      }
    });

    const attempted = correct + incorrect;
    const finalScore = Math.max(0, parseFloat(score.toFixed(2)));
    const accuracy = attempted > 0 ? parseFloat(((correct / attempted) * 100).toFixed(1)) : 0;

    const isCreator = challenge.creator.userId && currentUserId 
      ? challenge.creator.userId.toString() === currentUserId.toString()
      : challenge.creator.submittedAt === null;

    if (isCreator) {
      challenge.creator.score = finalScore;
      challenge.creator.accuracy = accuracy;
      challenge.creator.timeTakenSeconds = timeTakenSeconds;
      challenge.creator.submittedAt = new Date();
    } else {
      challenge.opponent.userId = currentUserId;
      challenge.opponent.name = currentUserName;
      challenge.opponent.score = finalScore;
      challenge.opponent.accuracy = accuracy;
      challenge.opponent.timeTakenSeconds = timeTakenSeconds;
      challenge.opponent.submittedAt = new Date();
    }

    if (challenge.creator.submittedAt && challenge.opponent.submittedAt) {
      challenge.status = 'completed';
      if (challenge.creator.score > challenge.opponent.score) {
        challenge.winner = 'creator';
      } else if (challenge.opponent.score > challenge.creator.score) {
        challenge.winner = 'opponent';
      } else {
        if (challenge.creator.timeTakenSeconds < challenge.opponent.timeTakenSeconds) {
          challenge.winner = 'creator';
        } else if (challenge.opponent.timeTakenSeconds < challenge.creator.timeTakenSeconds) {
          challenge.winner = 'opponent';
        } else {
          challenge.winner = 'tie';
        }
      }
    } else {
      challenge.status = 'active';
    }

    await challenge.save();
    res.json({ success: true, challenge });
  } catch (err) {
    console.error('Challenge submission error:', err);
    res.status(500).json({ success: false, message: 'Failed to record battle attempt.' });
  }
});

// Test Submission & Speed-Accuracy Scoring Route
app.post('/api/tests/submit', async (req, res) => {
  try {
    const { exam, answers, timeTakenSeconds } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid submission answers format.' });
    }

    let userId = null;
    let userName = 'Candidate';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.id;
        userName = decoded.name || userName;
      } catch (e) {}
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
    const questionAnalytics = [];
    const mistakesToSave = [];

    answers.forEach(ans => {
      const q = questionMap.get(ans.questionId);
      if (q) {
        totalMarks += (q.marks || 2);
        const isAttempted = ans.selectedOptionIndex !== null && ans.selectedOptionIndex !== undefined;
        const isCorrect = isAttempted && ans.selectedOptionIndex === q.correctOptionIndex;

        if (isAttempted) {
          if (isCorrect) {
            correct++;
            score += (q.marks || 2);
          } else {
            incorrect++;
            score -= (q.negativeMarks || 0.5);
            mistakesToSave.push({
              userId,
              questionId: ans.questionId,
              subject: q.subject || 'General Aptitude',
              topic: q.topic || 'General',
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              explanation: q.explanation,
              failedIn: exam || 'Mock Test'
            });
          }
        }

        questionAnalytics.push({
          questionId: ans.questionId,
          subject: q.subject || 'General Aptitude',
          timeSpentSeconds: ans.timeSpentSeconds || 0,
          isCorrect: Boolean(isCorrect),
          status: !isAttempted ? 'unattempted' : isCorrect ? 'correct' : 'incorrect'
        });
      }
    });

    if (mistakesToSave.length > 0) {
      await Mistake.insertMany(mistakesToSave, { ordered: false }).catch(() => {});
    }

    const attempted = correct + incorrect;
    const finalScore = Math.max(0, parseFloat(score.toFixed(2)));
    const accuracy = attempted > 0 ? parseFloat(((correct / attempted) * 100).toFixed(1)) : 0;

    const submission = await TestSubmission.create({
      userId,
      userName,
      exam: exam || 'SSC 100-Q Daily Mock',
      totalQuestions: answers.length,
      attempted,
      correct,
      incorrect,
      score: finalScore,
      totalMarks: totalMarks || answers.length * 2,
      accuracy,
      timeTakenSeconds: timeTakenSeconds || 0,
      questionAnalytics
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
      return res.status(400).json({ success: false, message: 'Please provide either a question description or image.' });
    }

    const contents = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg'
        }
      });
    }

    contents.push(`Subject Domain: ${subject || 'General Aptitude'}
You are ShikshaIQ's Master Exam Faculty for Indian competitive exams. Provide:
1. Core Concept
2. Step-by-Step Derivation
3. 30-Second Exam Shortcut Trick
4. Final Answer
Question: ${question || 'Solve the question in the attachment.'}`);

    const solutionText = await invokeGeminiWithFallback(contents);
    res.json({ success: true, solution: solutionText });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to resolve doubt.' });
  }
});

// AI Adaptive Weakness Drill Generator
app.post('/api/study-plan/weakness-drill', async (req, res) => {
  try {
    const { mistakes, targetExam = 'SSC CGL' } = req.body;
    if (!Array.isArray(mistakes) || mistakes.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one mistake record is required.' });
    }

    const mistakesSummary = mistakes.slice(0, 5).map((m, idx) =>
      `${idx + 1}. [${m.subject} - ${m.topic || 'General'}]: ${m.questionText}`
    ).join('\n');

    const prompt = `You are ShikshaIQ's Lead Remedial Faculty for ${targetExam}. The student failed:
${mistakesSummary}
Synthesize an adaptive 5-question "Trap Breaker" drill testing the exact same concepts with different values.
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "subject": "Quantitative Aptitude",
    "topic": "Target Topic",
    "questionText": "New fresh question here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "explanation": "Clear formula shortcut"
  }
]
Return strictly raw JSON without backticks or markdown fences.`;

    const rawOutput = await invokeGeminiWithFallback(prompt);
    let cleanText = rawOutput.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
    const drillQuestions = JSON.parse(cleanText);

    res.json({ success: true, drillQuestions: Array.isArray(drillQuestions) ? drillQuestions : [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to synthesize drill.' });
  }
});

// AI Smart Flashcard Deck Generator
app.post('/api/study-plan/flashcards', async (req, res) => {
  try {
    const { mistakes, targetExam = 'SSC CGL' } = req.body;
    if (!Array.isArray(mistakes) || mistakes.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one mistake record is required.' });
    }

    const mistakesSummary = mistakes.slice(0, 8).map((m, idx) =>
      `${idx + 1}. [${m.subject} - ${m.topic || 'General'}]: ${m.questionText}\nContext: ${m.explanation}`
    ).join('\n\n');

    const prompt = `You are ShikshaIQ's Chief Concept Architect for ${targetExam}. The student failed:
${mistakesSummary}
Create ultra-concise flashcards for each failed concept.
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": 1,
    "subject": "Quantitative Aptitude",
    "topic": "Geometry",
    "front": "Front question",
    "back": "Back formula",
    "mnemonicOrTip": "Tip"
  }
]
Return strictly raw JSON without backticks or markdown fences.`;

    const rawOutput = await invokeGeminiWithFallback(prompt);
    let cleanText = rawOutput.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
    const flashcards = JSON.parse(cleanText);

    res.json({ success: true, count: flashcards.length, flashcards: Array.isArray(flashcards) ? flashcards : [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate flashcards.' });
  }
});

// Category Cut-Off Predictor & Score Normalizer
app.post('/api/analytics/cutoff-predictor', async (req, res) => {
  try {
    const { rawScore, exam = 'SSC CGL', category = 'UR' } = req.body;
    const score = parseFloat(rawScore) || 0;

    const CUTOFF_BENCHMARKS = {
      'SSC CGL': { UR: { safe: 145, boundary: 135 }, OBC: { safe: 138, boundary: 128 }, EWS: { safe: 135, boundary: 125 }, SC: { safe: 120, boundary: 110 }, ST: { safe: 110, boundary: 100 } },
      'RRB NTPC': { UR: { safe: 78, boundary: 72 }, OBC: { safe: 74, boundary: 68 }, EWS: { safe: 71, boundary: 65 }, SC: { safe: 65, boundary: 58 }, ST: { safe: 60, boundary: 53 } }
    };

    const targetExam = CUTOFF_BENCHMARKS[exam] ? exam : 'SSC CGL';
    const benchmark = CUTOFF_BENCHMARKS[targetExam][category] || CUTOFF_BENCHMARKS[targetExam]['UR'];

    let qualificationStatus = 'High Risk';
    let probabilityPercent = 25;
    let deltaNeeded = Math.max(0, benchmark.safe - score);

    if (score >= benchmark.safe) {
      qualificationStatus = 'Safe Zone (Cleared Tier-1)';
      probabilityPercent = Math.min(99, Math.round(85 + ((score - benchmark.safe) * 0.5)));
      deltaNeeded = 0;
    } else if (score >= benchmark.boundary) {
      qualificationStatus = 'Borderline / Moderate Chance';
      probabilityPercent = Math.round(50 + (((score - benchmark.boundary) / (benchmark.safe - benchmark.boundary)) * 30));
    } else {
      probabilityPercent = Math.max(5, Math.round((score / benchmark.boundary) * 45));
    }

    const estimatedNormalizedScore = parseFloat((score * 1.045).toFixed(2));

    res.json({
      success: true,
      exam: targetExam,
      category,
      rawScore: score,
      estimatedNormalizedScore,
      benchmarkSafe: benchmark.safe,
      benchmarkBoundary: benchmark.boundary,
      probabilityPercent,
      qualificationStatus,
      deltaNeeded: parseFloat(deltaNeeded.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate cut-off.' });
  }
});

// Current Affairs & Government Job Feeds
app.get('/api/current-affairs', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    let items = await CurrentAffair.find(filter).sort({ createdAt: -1 }).limit(15);
    
    if (!items || items.length === 0) {
      await generateDailyAffairsWithGemini();
      items = await CurrentAffair.find(filter).sort({ createdAt: -1 }).limit(15);
    }

    res.json({ success: true, capsules: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch current affairs.' });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    let jobs = await JobAlert.find().sort({ createdAt: -1 }).limit(20);
    if (!jobs || jobs.length === 0) {
      await generateDailyJobsWithGemini();
      jobs = await JobAlert.find().sort({ createdAt: -1 }).limit(20);
    }
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
  .then(async () => {
    console.log('MongoDB Atlas connection established successfully.');
    
    // Auto-generate fresh content on startup
    await generateDailyAffairsWithGemini();
    await generateDailyJobsWithGemini(); // <--- Automated pan-India job alerts sync on startup

    // Schedule daily sync via cron at 6:00 AM daily
    cron.schedule('0 6 * * *', async () => {
      console.log('[Cron] Triggering daily automated Gemini content refresh...');
      await generateDailyAffairsWithGemini();
      await generateDailyJobsWithGemini();
    });

    server.listen(PORT, () => {
      console.log(`ShikshaIQ backend & WebSocket engine running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Atlas connection failed:', err);
    process.exit(1);
  });