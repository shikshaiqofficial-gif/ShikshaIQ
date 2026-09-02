require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Stabilizes MongoDB Atlas SRV lookup on Indian ISPs

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shikshaiq_super_secret_jwt_key_2026';

// Initialize Gemini Generative AI SDK (@google/genai syntax)
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

// Accept up to 20MB for Base64 screenshot/diagram uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// ----------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// ----------------------------------------------------
// 1. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  targetExam: { type: String, default: 'SSC CGL' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Question Schema
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
  year: { type: Number, default: 2024 }
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

// 3. Test Submission Schema
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

// 4. Current Affairs Schema
const currentAffairSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'National' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  summary: { type: String, required: true },
  keyTakeaways: [{ type: String }],
  source: { type: String, default: 'PIB / The Hindu' }
}, { timestamps: true });

const CurrentAffair = mongoose.models.CurrentAffair || mongoose.model('CurrentAffair', currentAffairSchema);

// 5. Job Alert Schema
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
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// --- AUTHENTICATION ---
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

// --- QUESTIONS MANAGEMENT ---
app.get('/api/questions', async (req, res) => {
  try {
    const { exam, subject, difficulty, limit = 20 } = req.query;
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

// --- TEST SUBMISSION & SCORECARD ENGINE ---
app.post('/api/tests/submit', verifyToken, async (req, res) => {
  try {
    const { exam, answers, timeTakenSeconds } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid submission answers format.' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    let correct = 0;
    let incorrect = 0;
    let score = 0;
    let totalMarks = 0;

    answers.forEach(ans => {
      const q = questionMap.get(ans.questionId.toString());
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
      exam: exam || 'SSC Mock Test',
      totalQuestions: questions.length,
      attempted,
      correct,
      incorrect,
      score: finalScore,
      totalMarks,
      accuracy,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    res.status(201).json({ success: true, result: submission });
  } catch (error) {
    console.error('Test submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to process test submission.' });
  }
});

// --- LEADERBOARD ---
app.get('/api/leaderboard', async (req, res) => {
  try {
    const submissions = await TestSubmission.find()
      .sort({ score: -1, accuracy: -1, timeTakenSeconds: 1 })
      .limit(50);

    if (submissions.length === 0) {
      return res.json({
        success: true,
        leaderboard: [
          { _id: '1', userName: 'Ananya Sharma', exam: 'SSC CGL', score: 48, totalMarks: 50, accuracy: 96, timeTakenSeconds: 710 },
          { _id: '2', userName: 'Rahul Verma', exam: 'SSC CGL', score: 46, totalMarks: 50, accuracy: 92, timeTakenSeconds: 780 },
          { _id: '3', userName: 'Pooja Iyer', exam: 'RRB NTPC', score: 44, totalMarks: 50, accuracy: 90, timeTakenSeconds: 840 }
        ]
      });
    }

    res.json({ success: true, leaderboard: submissions });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve leaderboard rankings.' });
  }
});

// --- GEMINI MULTIMODAL DOUBT SOLVER (TEXT + DIAGRAMS) ---
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
        message: 'Gemini API key is not configured on the server.'
      });
    }

    const systemPrompt = `You are ShikshaIQ's Master Exam Faculty for Indian competitive exams (SSC CGL, RRB NTPC, Banking).
Subject Domain: ${subject || 'General Aptitude'}

Analyze the candidate's question and any attached visual diagram/screenshot.
Provide a structured pedagogical answer in clean Markdown:
1. **Core Concept & Theorem**: Identify the underlying rule or identity.
2. **Step-by-Step Derivation**: Detailed calculation with clear intermediate steps.
3. **Exam Shortcut / 30-Second Trick**: The fastest way to solve this in an actual timed examination.
4. **Final Answer**: Explicitly state the correct option or final numeric value.`;

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

    contents.push({
      text: `${systemPrompt}\n\nCandidate Question Statement: ${question || 'Solve the question presented in the attached image.'}`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents
    });

    const solutionText = response.text;
    res.json({ success: true, solution: solutionText });
  } catch (error) {
    console.error('Gemini vision doubt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve doubt using Gemini Vision.'
    });
  }
});

// --- GEMINI AI PERSONALIZED 7-DAY STUDY PLAN GENERATOR ---
app.post('/api/study-plan/generate', verifyToken, async (req, res) => {
  try {
    const { targetExam, weakSubjects, recentScore, accuracy } = req.body;

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured on the server.'
      });
    }

    const prompt = `You are the lead academic mentor at ShikshaIQ for competitive exams.
Student Profile:
- Target Exam: ${targetExam || 'SSC CGL'}
- Recent Test Score: ${recentScore ?? 'N/A'}
- Overall Accuracy: ${accuracy ?? 'N/A'}%
- Weak Areas Identified: ${weakSubjects || 'Quantitative Aptitude, General Reasoning'}

Generate a practical, high-impact 7-day revision schedule in pure JSON.
The JSON object must strictly match this format:
{
  "focusSummary": "2-sentence diagnosis of the candidate's current exam readiness and key weaknesses.",
  "days": [
    {
      "day": "Day 1",
      "subject": "Name of Subject",
      "topic": "Specific Topic",
      "targetQuestions": 35,
      "strategyTip": "Actionable shortcut, formula, or exam strategy"
    }
  ]
}

Return ONLY raw JSON, without markdown formatting, backticks, or extra commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    const planData = JSON.parse(rawText);
    res.json({ success: true, plan: planData });
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate personalized study plan.'
    });
  }
});

// --- CURRENT AFFAIRS & JOB ALERTS ---
app.get('/api/current-affairs', async (req, res) => {
  try {
    let items = await CurrentAffair.find().sort({ createdAt: -1 }).limit(10);

    if (items.length === 0) {
      items = [
        {
          title: 'India Advances Renewable Energy Capacity Beyond 190 GW Milestone',
          category: 'Economy & Energy',
          date: new Date().toISOString().split('T')[0],
          summary: 'India achieved a historic milestone in non-fossil power generation, surpassing 190 GW installed renewable capacity.',
          keyTakeaways: ['Solar energy accounts for over 50% of the newly added capacity', 'Target set for 500 GW by 2030']
        },
        {
          title: 'ISRO Unveils Next-Gen Launch Vehicle (NGLV) Architecture',
          category: 'Science & Technology',
          date: new Date().toISOString().split('T')[0],
          summary: 'ISRO outlined the developmental trajectory for the NGLV, engineered to replace LVM3 with reusable first-stage boosters.',
          keyTakeaways: ['Payload capability up to 30 tonnes to Low Earth Orbit', 'Methane-LOX propulsion configuration']
        }
      ];
    }

    res.json({ success: true, capsules: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch current affairs.' });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    let jobs = await JobAlert.find().sort({ createdAt: -1 }).limit(10);

    if (jobs.length === 0) {
      jobs = [
        {
          title: 'SSC Combined Graduate Level (CGL) Examination 2026',
          organization: 'Staff Selection Commission (SSC)',
          vacancies: '14,500+ Group B & C Posts',
          qualification: "Bachelor's Degree in any discipline",
          lastDate: '30 September 2026',
          applyUrl: '[https://ssc.gov.in](https://ssc.gov.in)',
          category: 'Central Govt'
        },
        {
          title: 'RRB Non-Technical Popular Categories (NTPC)',
          organization: 'Railway Recruitment Boards',
          vacancies: '11,558 Posts',
          qualification: '12th Pass / Graduate depending on post',
          lastDate: '15 October 2026',
          applyUrl: '[https://indianrailways.gov.in](https://indianrailways.gov.in)',
          category: 'Railways'
        }
      ];
    }

    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job notifications.' });
  }
});

// ----------------------------------------------------
// DATABASE CONNECTION & SERVER INITIALIZATION
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