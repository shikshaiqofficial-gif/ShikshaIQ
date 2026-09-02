require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shiksha_iq_super_secret_jwt_key_2026_prod';

// ==========================================
// 1. MIDDLEWARE & CORS CONFIGURATION
// ==========================================
const allowedOrigins = [
  'https://shiksha-iq-omega.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==========================================
// 2. MONGODB ATLAS CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Fatal Error: MONGO_URI is missing from environment variables.");
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('🍃 MongoDB Atlas Connected Successfully'))
    .catch((err) => console.error('❌ MongoDB Connection Failed:', err.message));
}

// ==========================================
// 3. DATABASE SCHEMAS & MODELS
// ==========================================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  targetExam: { type: String, default: 'SSC CGL' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  exam: { type: String, required: true, index: true },
  subject: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate' },
  marks: { type: Number, default: 2 },
  negativeMarks: { type: Number, default: 0.5 },
  createdAt: { type: Date, default: Date.now }
});
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

// Test Result / Scorecard Schema
const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  exam: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  attempted: { type: Number, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  accuracy: { type: Number, default: 0 },
  timeTakenSeconds: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);

// ==========================================
// 4. AUTHENTICATION MIDDLEWARE
// ==========================================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ==========================================
// 5. GEMINI AI CLIENT
// ==========================================
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// ==========================================
// 6. API ROUTES
// ==========================================

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Shiksha IQ API',
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, targetExam } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      targetExam: targetExam || 'SSC CGL'
    });

    const token = jwt.sign({ id: newUser._id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, targetExam: newUser.targetExam }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, targetExam: user.targetExam }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User Profile
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- QUESTION MANAGEMENT ROUTES ---

// Get Questions (Random sample or filtered)
app.get('/api/questions', async (req, res) => {
  try {
    const { exam, limit = 20 } = req.query;
    const filter = exam ? { exam } : {};
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit, 10) } }
    ]);
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a New Question (Admin)
app.post('/api/questions', async (req, res) => {
  try {
    const { 
      exam, 
      subject, 
      questionText, 
      options, 
      correctOptionIndex, 
      explanation, 
      difficulty, 
      marks, 
      negativeMarks 
    } = req.body;

    if (!exam || !subject || !questionText || !options || options.length < 2 || correctOptionIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exam, subject, question text, at least 2 options, and correct option index are required.' 
      });
    }

    const newQuestion = await Question.create({
      exam,
      subject,
      questionText,
      options,
      correctOptionIndex: parseInt(correctOptionIndex, 10),
      explanation: explanation || 'No explanation provided.',
      difficulty: difficulty || 'Moderate',
      marks: marks !== undefined ? Number(marks) : 2,
      negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0.5
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully!',
      question: newQuestion
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a Question by ID (Admin)
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    res.json({ success: true, message: 'Question deleted successfully!' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- MOCK TEST SUBMISSION ROUTE ---
app.post('/api/tests/submit', verifyToken, async (req, res) => {
  try {
    const { exam, answers, timeTakenSeconds } = req.body; 

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers payload must be an array.' });
    }

    let correct = 0;
    let incorrect = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    answers.forEach(ans => {
      const q = questionMap.get(ans.questionId.toString());
      if (q) {
        maxPossibleScore += q.marks;
        if (ans.selectedOptionIndex === null || ans.selectedOptionIndex === undefined) {
          // Unattempted
        } else if (ans.selectedOptionIndex === q.correctOptionIndex) {
          correct++;
          totalScore += q.marks;
        } else {
          incorrect++;
          totalScore -= q.negativeMarks;
        }
      }
    });

    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(2) : 0;
    const finalScore = Math.max(0, totalScore);

    const newResult = await Result.create({
      user: req.user.id,
      userName: req.user.name,
      exam: exam || 'SSC Mock Test',
      totalQuestions: questions.length,
      attempted,
      correct,
      incorrect,
      score: parseFloat(finalScore.toFixed(2)),
      totalMarks: maxPossibleScore,
      accuracy: parseFloat(accuracy),
      timeTakenSeconds: timeTakenSeconds || 0
    });

    res.json({
      success: true,
      result: newResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- LEADERBOARD ROUTE ---
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Result.find()
      .sort({ score: -1, accuracy: -1, timeTakenSeconds: 1 })
      .limit(50)
      .select('userName exam score totalMarks accuracy timeTakenSeconds createdAt');

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- GEMINI AI DOUBT SOLVER ---
app.post('/api/doubts/solve', async (req, res) => {
  try {
    const { question, imageBase64, mimeType } = req.body;

    if (!process.env.GEMINI_API_KEY || !genAI) {
      return res.status(500).json({ success: false, message: 'Gemini API key is not configured on the server.' });
    }

    if (!question && !imageBase64) {
      return res.status(400).json({ success: false, message: 'Please provide a question or an image.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const systemPrompt = `You are the expert tutor of Shiksha IQ, specializing in competitive exams (SSC CGL, CHSL, RRB NTPC, Banking). 
Provide a clear, structured, step-by-step solution.
Include:
1. Core Concept / Formula Used
2. Step-by-Step Derivation or Logical Reasoning
3. Final Answer clearly highlighted
4. Quick Exam Shortcut / Trick (if applicable)`;

    let promptParts = [systemPrompt];

    if (question) {
      promptParts.push(`Student Question: ${question}`);
    }

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      promptParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || 'image/jpeg'
        }
      });
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const answerText = response.text();

    res.json({
      success: true,
      answer: answerText
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to solve doubt with Gemini AI.' });
  }
});

// =========================================================
// 7. ONE-CLICK DATABASE SEED ENDPOINT (50 PYQs)
// =========================================================
app.get('/api/seed', async (req, res) => {
  try {
    const count = await Question.countDocuments();
    if (count >= 50) {
      return res.json({
        success: true,
        message: `Database already seeded with ${count} questions!`
      });
    }

    const sampleQuestions = [
      // Quantitative Aptitude
      { exam: "SSC CGL", subject: "Quantitative Aptitude", questionText: "If x + 1/x = 5, what is the value of x³ + 1/x³?", options: ["110", "125", "140", "115"], correctOptionIndex: 0, explanation: "x³ + 1/x³ = (x + 1/x)³ - 3(x + 1/x) = 5³ - 3(5) = 110", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Quantitative Aptitude", questionText: "A shopkeeper marks an article at 40% above CP and allows a discount of 25%. What is his profit %?", options: ["5% Profit", "5% Loss", "10% Profit", "8% Profit"], correctOptionIndex: 0, explanation: "Let CP = 100. MP = 140. SP = 140 * 0.75 = 105. Profit = 5%", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Quantitative Aptitude", questionText: "The ratio of speeds of two trains is 7:8. If the second train runs 400 km in 4 hours, find speed of first train.", options: ["70 km/h", "75 km/h", "87.5 km/h", "80 km/h"], correctOptionIndex: 2, explanation: "Speed 2 = 100 km/h. Speed 1 = (7/8) * 100 = 87.5 km/h", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Quantitative Aptitude", questionText: "If sin θ + cos θ = √2 cos(90° - θ), find cot θ.", options: ["√2 - 1", "√2 + 1", "1/√2", "1"], correctOptionIndex: 0, explanation: "sin θ + cos θ = √2 sin θ => cos θ = (√2 - 1) sin θ => cot θ = √2 - 1", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Quantitative Aptitude", questionText: "A can complete work in 12 days and B in 18 days. If they work together for 4 days, what fraction remains?", options: ["4/9", "5/9", "1/3", "2/9"], correctOptionIndex: 0, explanation: "Efficiency: 3 + 2 = 5/day. 4 days = 20 units. Remaining: 16/36 = 4/9", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Quantitative Aptitude", questionText: "A sum doubles itself in 5 years at SI. In how many years will it become 4 times?", options: ["10 years", "12 years", "15 years", "20 years"], correctOptionIndex: 2, explanation: "SI1 = P in 5 yrs. SI2 = 3P in 3 * 5 = 15 yrs", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Quantitative Aptitude", questionText: "Average age of 30 students is 14 years. If teacher is included, average increases by 1 year. Teacher's age is:", options: ["42 years", "45 years", "44 years", "46 years"], correctOptionIndex: 1, explanation: "Teacher's age = 15 + (30 * 1) = 45 years", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Quantitative Aptitude", questionText: "The circumference of base of a cylinder is 44 cm and height is 15 cm. Find volume (π = 22/7).", options: ["2310 cm³", "2150 cm³", "1980 cm³", "2420 cm³"], correctOptionIndex: 0, explanation: "2πr = 44 => r = 7 cm. Vol = (22/7)*7*7*15 = 2310 cm³", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Quantitative Aptitude", questionText: "Difference between CI and SI on a sum for 2 years at 10% per annum is ₹65. What is the principal?", options: ["₹6,000", "₹6,500", "₹7,000", "₹6,250"], correctOptionIndex: 1, explanation: "Diff = P(R/100)² => 65 = P(0.01) => P = ₹6,500", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Quantitative Aptitude", questionText: "If a:b = 3:4 and b:c = 8:9, find a:b:c.", options: ["3:8:9", "6:8:9", "3:4:9", "6:4:9"], correctOptionIndex: 1, explanation: "Multiply a:b by 2 => 6:8. Since b:c = 8:9, ratio is 6:8:9", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "RRB NTPC", subject: "Quantitative Aptitude", questionText: "Find HCF of 36, 54, and 90.", options: ["12", "18", "6", "9"], correctOptionIndex: 1, explanation: "Highest common divisor is 18", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Quantitative Aptitude", questionText: "A 250 m long train crosses a pole in 15 seconds. Speed in km/h is:", options: ["54 km/h", "60 km/h", "48 km/h", "72 km/h"], correctOptionIndex: 1, explanation: "Speed = (250/15) * (18/5) = 60 km/h", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Quantitative Aptitude", questionText: "Pipe A fills in 6 hrs, Pipe B empties in 8 hrs. Both open, time to fill:", options: ["18 hours", "24 hours", "20 hours", "12 hours"], correctOptionIndex: 1, explanation: "Rate = 1/6 - 1/8 = 1/24 => 24 hours", difficulty: "Moderate", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Quantitative Aptitude", questionText: "Successive discounts of 20% and 10% are equivalent to single discount of:", options: ["30%", "28%", "25%", "26%"], correctOptionIndex: 1, explanation: "20 + 10 - 200/100 = 28%", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Quantitative Aptitude", questionText: "The mean of 29, 36, 21, 18, 7, 19, k, k is 21.25. Find k.", options: ["18", "20", "22", "25"], correctOptionIndex: 1, explanation: "130 + 2k = 21.25 * 8 = 170 => 2k = 40 => k = 20", difficulty: "Moderate", marks: 1, negativeMarks: 0.33 },
      { exam: "SSC CGL", subject: "Quantitative Aptitude", questionText: "Perimeter of quadrant of a circle of radius 14 cm is:", options: ["36 cm", "50 cm", "44 cm", "56 cm"], correctOptionIndex: 1, explanation: "2r + πr/2 = 28 + 22 = 50 cm", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "RRB NTPC", subject: "Quantitative Aptitude", questionText: "Find least square number divisible by 10, 12, 15, and 18.", options: ["3600", "900", "1800", "2500"], correctOptionIndex: 1, explanation: "LCM = 180 = 2² * 3² * 5¹. Square = 180 * 5 = 900", difficulty: "Moderate", marks: 1, negativeMarks: 0.33 },

      // Logical Reasoning
      { exam: "SSC CGL", subject: "Reasoning", questionText: "Find missing term in series: 3, 9, 27, 81, 243, ?", options: ["626", "729", "512", "810"], correctOptionIndex: 1, explanation: "3^6 = 729", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Reasoning", questionText: "6 : 42 :: 8 : ?", options: ["64", "72", "80", "90"], correctOptionIndex: 1, explanation: "n * (n + 1) => 8 * 9 = 72", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Reasoning", questionText: "In code language, 'ROSE' is 'ILHV'. How is 'HAND' written?", options: ["SZMW", "SZMV", "TZMW", "SYNW"], correctOptionIndex: 0, explanation: "Opposite letter pairs: H->S, A->Z, N->M, D->W", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Reasoning", questionText: "Ramesh said, 'She is the daughter of my father\\'s only son.' Relation?", options: ["Sister", "Daughter", "Niece", "Mother"], correctOptionIndex: 1, explanation: "Father's only son is Ramesh. She is his daughter.", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "Reasoning", questionText: "Statements: All cars are four-wheelers. All four-wheelers are vehicles. Conclusions: I. All cars are vehicles. II. Some vehicles are four-wheelers.", options: ["Only I follows", "Only II follows", "Neither follows", "Both I and II follow"], correctOptionIndex: 3, explanation: "Both conclusions follow universally.", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Reasoning", questionText: "Find the odd one out: 121, 169, 289, 324.", options: ["121", "169", "289", "324"], correctOptionIndex: 3, explanation: "121 (11²), 169 (13²), 289 (17²) are prime squares. 324 (18²) is composite.", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Reasoning", questionText: "Rohan walks 10m East, turns left 15m, then turns right 5m. Facing direction?", options: ["North", "East", "South", "West"], correctOptionIndex: 1, explanation: "East -> Left (North) -> Right (East)", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Reasoning", questionText: "If + is ÷, - is ×, × is +, ÷ is -. Evaluate: 36 × 12 - 4 ÷ 24 + 6", options: ["80", "72", "40", "84"], correctOptionIndex: 0, explanation: "36 + 12*4 - 24/6 = 36 + 48 - 4 = 80", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Reasoning", questionText: "Venn relationship: Doctors, Surgeons, Musicians.", options: ["All Surgeons are Doctors, some are Musicians", "Doctors and Musicians disjoint", "Surgeons and Musicians disjoint", "None"], correctOptionIndex: 0, explanation: "Surgeons ⊂ Doctors; both intersect Musicians.", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "Reasoning", questionText: "Missing number: 5, 11, 23, 47, 95, ?", options: ["189", "191", "190", "192"], correctOptionIndex: 1, explanation: "*2 + 1 => 95 * 2 + 1 = 191", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "RRB NTPC", subject: "Reasoning", questionText: "Select INCORRECT letter-cluster: MNO, PQR, STU, WXY, ZAB.", options: ["MNO", "STU", "WXY", "ZAB"], correctOptionIndex: 2, explanation: "Should be VWX instead of WXY", difficulty: "Moderate", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Reasoning", questionText: "'sky is blue' -> 'mn pq rs', 'blue is water' -> 'pq rs tu', 'water and sky' -> 'tu vw mn'. Code for 'and'?", options: ["mn", "pq", "tu", "vw"], correctOptionIndex: 3, explanation: "Remaining code for 'and' is 'vw'", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Reasoning", questionText: "Statements: K = P < C; P > Q; Q > L. Which is true?", options: ["Both Q < C and K > L are true", "Only Q < C is true", "Only K > L is true", "Neither"], correctOptionIndex: 0, explanation: "L < Q < K = P < C, so both hold", difficulty: "Moderate", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Reasoning", questionText: "Next number: 1, 2, 6, 24, 120, ?", options: ["600", "720", "840", "500"], correctOptionIndex: 1, explanation: "Factorials: 120 * 6 = 720", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "Reasoning", questionText: "If CLOCK is KCOLC, then WATCH is:", options: ["HCTAW", "HCTWA", "HCATW", "HTCAW"], correctOptionIndex: 0, explanation: "Reversed word: H-C-T-A-W", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "SSC CGL", subject: "Reasoning", questionText: "Number of triangles in a standard 5-pointed star (pentagram):", options: ["5", "10", "12", "8"], correctOptionIndex: 1, explanation: "5 small triangles + 5 large = 10", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "RRB NTPC", subject: "Reasoning", questionText: "ACE : FHJ :: CEG : ?", options: ["HKM", "HJN", "HJL", "GIK"], correctOptionIndex: 2, explanation: "+5 shift: C->H, E->J, G->L", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },

      // General Awareness
      { exam: "SSC CGL", subject: "General Awareness", questionText: "Which Article gives Supreme Court writ powers for Fundamental Rights?", options: ["Article 226", "Article 32", "Article 143", "Article 131"], correctOptionIndex: 1, explanation: "Article 32 (Heart and Soul of the Constitution)", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "General Awareness", questionText: "Founder of the Maurya Empire?", options: ["Ashoka", "Bindusara", "Chandragupta Maurya", "Pushyamitra Shunga"], correctOptionIndex: 2, explanation: "Chandragupta Maurya in 322 BCE", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "General Awareness", questionText: "In which year was GST implemented in India?", options: ["2015", "2016", "2017", "2018"], correctOptionIndex: 2, explanation: "July 1, 2017 via 101st Constitutional Amendment", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "General Awareness", questionText: "Which hormone is called the 'fight-or-flight' hormone?", options: ["Thyroxine", "Insulin", "Adrenaline", "Melatonin"], correctOptionIndex: 2, explanation: "Adrenaline from the adrenal gland", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CGL", subject: "General Awareness", questionText: "Tropic of Cancer does NOT pass through which of the following states?", options: ["Rajasthan", "Chhattisgarh", "Odisha", "Tripura"], correctOptionIndex: 2, explanation: "Passes through 8 states; does not pass through Odisha", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "General Awareness", questionText: "Chemical name of Vitamin C:", options: ["Retinol", "Ascorbic acid", "Thiamine", "Calciferol"], correctOptionIndex: 1, explanation: "Ascorbic acid", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "General Awareness", questionText: "Who presided over the 1907 Surat Session of INC?", options: ["Rash Behari Ghosh", "Dadabhai Naoroji", "Gopal Krishna Gokhale", "Bal Gangadhar Tilak"], correctOptionIndex: 0, explanation: "Dr. Rash Behari Ghosh", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "General Awareness", questionText: "Atmosphere layer containing the ozone layer:", options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"], correctOptionIndex: 1, explanation: "Stratosphere", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "General Awareness", questionText: "Classical dance form Kathakali originated in:", options: ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh"], correctOptionIndex: 1, explanation: "Kerala", difficulty: "Easy", marks: 2, negativeMarks: 0.5 },
      { exam: "SSC CHSL", subject: "General Awareness", questionText: "Gland regulating calcium levels in the blood:", options: ["Pituitary", "Thyroid & Parathyroid", "Pancreas", "Adrenal"], correctOptionIndex: 1, explanation: "Parathyroid and Thyroid glands", difficulty: "Moderate", marks: 2, negativeMarks: 0.5 },
      { exam: "RRB NTPC", subject: "General Awareness", questionText: "Headquarters of Indian Railway Board located at:", options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], correctOptionIndex: 1, explanation: "Rail Bhavan, New Delhi", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "General Awareness", questionText: "Planet known as the 'Red Planet':", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctOptionIndex: 1, explanation: "Mars (due to iron oxide)", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "General Awareness", questionText: "HTTP stands for:", options: ["HyperText Transfer Protocol", "High Transfer Text Procedure", "Hyperlink Transit Text Protocol", "Hybrid Text Telecommunication Program"], correctOptionIndex: 0, explanation: "HyperText Transfer Protocol", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "General Awareness", questionText: "Who composed 'Vande Mataram'?", options: ["Rabindranath Tagore", "Bankim Chandra Chattopadhyay", "Sarojini Naidu", "Sri Aurobindo"], correctOptionIndex: 1, explanation: "Bankim Chandra Chattopadhyay (1882)", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "General Awareness", questionText: "SI unit of electric current:", options: ["Volt", "Watt", "Ampere", "Ohm"], correctOptionIndex: 2, explanation: "Ampere (A)", difficulty: "Easy", marks: 1, negativeMarks: 0.33 },
      { exam: "RRB NTPC", subject: "General Awareness", questionText: "National Park famous for Great One-horned Rhinoceros:", options: ["Jim Corbett", "Kaziranga National Park", "Sundarbans", "Gir"], correctOptionIndex: 1, explanation: "Kaziranga in Assam", difficulty: "Easy", marks: 1, negativeMarks: 0.33 }
    ];

    const inserted = await Question.insertMany(sampleQuestions);
    res.json({
      success: true,
      message: `Successfully seeded ${inserted.length} questions directly into MongoDB Atlas!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// --- CURRENT AFFAIRS SCHEMA & ROUTES ---
const currentAffairsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // National, Economy, Science & Tech, Sports, International
  date: { type: String, required: true },
  summary: { type: String, required: true },
  bulletPoints: [{ type: String }],
  quiz: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctOptionIndex: { type: Number, required: true },
      explanation: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const CurrentAffair = mongoose.models.CurrentAffair || mongoose.model('CurrentAffair', currentAffairsSchema);

// Get all capsules & quiz
app.get('/api/current-affairs', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    let capsules = await CurrentAffair.find(filter).sort({ createdAt: -1 });

    // Seed default capsules if database is empty
    if (capsules.length === 0) {
      const defaultCapsules = [
        {
          title: "India Expands Dedicated Freight Corridor Network",
          category: "National",
          date: "September 2026",
          summary: "Indian Railways successfully commissions a high-speed freight link connecting western industrial ports to northern logistics hubs, reducing transit turnaround by 35%.",
          bulletPoints: [
            "Part of the National Rail Plan 2030 objective.",
            "Increases average freight train speed from 25 km/h to over 65 km/h.",
            "Drastically cuts logistic supply chain carbon footprints."
          ],
          quiz: [
            {
              questionText: "What is the primary objective of the Dedicated Freight Corridor (DFC) in India?",
              options: ["High-speed passenger travel", "Segregating freight from passenger lines", "Replacing road transport entirely", "Metro rail expansion"],
              correctOptionIndex: 1,
              explanation: "DFCs segregate freight traffic from passenger lines to increase goods speed and lower logistical overheads."
            }
          ]
        },
        {
          title: "RBI Advances UPI Multi-Currency Cross-Border Linkages",
          category: "Economy",
          date: "September 2026",
          summary: "Reserve Bank of India expands bilateral real-time payment linkages across major Southeast Asian and Gulf central banks to ease remittance flows.",
          bulletPoints: [
            "Enables direct settlement without third-party intermediate currencies.",
            "Drastically reduces cross-border retail transaction charges.",
            "Built on interoperable ISO 20022 messaging protocols."
          ],
          quiz: [
            {
              questionText: "Which organization operates the Unified Payments Interface (UPI) infrastructure in India?",
              options: ["Reserve Bank of India (RBI)", "NPCI", "SEBI", "NITI Aayog"],
              correctOptionIndex: 1,
              explanation: "NPCI (National Payments Corporation of India) develops and manages UPI."
            }
          ]
        },
        {
          title: "ISRO Tests Next-Gen Cryogenic Engine for Heavy Lift Launchers",
          category: "Science & Tech",
          date: "September 2026",
          summary: "ISRO successfully conducts endurance tests on an upgraded semi-cryogenic rocket stage for enhanced payload capabilities to Geosynchronous Transfer Orbit (GTO).",
          bulletPoints: [
            "Utilizes Isrosene (aviation-grade kerosene) and liquid oxygen.",
            "Replaces current solid boosters to maximize launch capacity.",
            "Critical propulsion stepping stone for lunar sample return operations."
          ],
          quiz: [
            {
              questionText: "What fuel combination powers semi-cryogenic rocket stages developed by ISRO?",
              options: ["Liquid Hydrogen & Liquid Oxygen", "Refined Kerosene & Liquid Oxygen", "Hydrazine & Nitrogen Tetroxide", "Solid Composite Fuel"],
              correctOptionIndex: 1,
              explanation: "Semi-cryogenic stages use refined kerosene (Isrosene) as fuel and liquid oxygen (LOX) as oxidizer."
            }
          ]
        },
        {
          title: "India Clinches Championship at Asian Badminton Team Finals",
          category: "Sports",
          date: "September 2026",
          summary: "Indian shuttlers display commanding performances across singles and doubles rubbers to secure gold against regional heavyweights.",
          bulletPoints: [
            "Straight-set victories in both men's and mixed doubles categories.",
            "Reinforces preparation momentum leading up to international championships.",
            "Young talent pool steps into decisive high-pressure encounters."
          ],
          quiz: [
            {
              questionText: "Which prestigious international team badminton trophy is awarded for the Men's World Championship?",
              options: ["Uber Cup", "Thomas Cup", "Sudirman Cup", "Sultan Azlan Shah Cup"],
              correctOptionIndex: 1,
              explanation: "Thomas Cup is the Men's World Team Badminton Championship, while Uber Cup is for women."
            }
          ]
        },
        {
          title: "Global Clean Energy Ministerial Concludes with Green Hydrogen Accord",
          category: "International",
          date: "September 2026",
          summary: "Over 35 nations sign harmonized standards for green hydrogen certification and carbon accounting to foster cross-border clean fuel trade.",
          bulletPoints: [
            "Aligns standards for electrolyzer efficiency and grid origin proof.",
            "India positions itself as a major competitive export hub.",
            "Includes dedicated financial underwriting for global South green infrastructure."
          ],
          quiz: [
            {
              questionText: "Under India's National Green Hydrogen Mission, what is green hydrogen produced from?",
              options: ["Coal gasification", "Electrolysis of water using renewable power", "Natural gas reforming", "Nuclear thermal splitting"],
              correctOptionIndex: 1,
              explanation: "Green hydrogen is generated through water electrolysis powered entirely by renewable energy sources."
            }
          ]
        }
      ];

      capsules = await CurrentAffair.insertMany(defaultCapsules);
    }

    res.json({ success: true, count: capsules.length, capsules });
  } catch (err) {
    console.error('Error fetching current affairs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- JOB ALERTS SCHEMA & ROUTES ---
const jobAlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  examAgency: { type: String, required: true }, // SSC, RRB, State PSC, Banking
  vacancies: { type: String, required: true },
  qualification: { type: String, required: true },
  ageLimit: { type: String, required: true },
  applicationStartDate: { type: String, required: true },
  applicationEndDate: { type: String, required: true },
  examDate: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Upcoming', 'Closed'], default: 'Active' },
  notificationUrl: { type: String, default: '#' },
  applyUrl: { type: String, default: '#' },
  createdAt: { type: Date, default: Date.now }
});

const JobAlert = mongoose.models.JobAlert || mongoose.model('JobAlert', jobAlertSchema);

// Get All Job Alerts
app.get('/api/jobs', async (req, res) => {
  try {
    const { agency, status } = req.query;
    const filter = {};
    if (agency && agency !== 'ALL') filter.examAgency = agency;
    if (status && status !== 'ALL') filter.status = status;

    let jobs = await JobAlert.find(filter).sort({ createdAt: -1 });

    // Auto-seed default notifications if empty
    if (jobs.length === 0) {
      const defaultJobs = [
        {
          title: "SSC Combined Graduate Level (CGL) Examination",
          examAgency: "SSC",
          vacancies: "14,500+ Posts",
          qualification: "Bachelor's Degree in any discipline",
          ageLimit: "18 - 32 Years",
          applicationStartDate: "June 2026",
          applicationEndDate: "July 2026",
          examDate: "September / October 2026",
          status: "Active",
          notificationUrl: "https://ssc.gov.in",
          applyUrl: "https://ssc.gov.in"
        },
        {
          title: "RRB Non-Technical Popular Categories (NTPC)",
          examAgency: "RRB",
          vacancies: "11,558 Posts",
          qualification: "12th Pass / Graduate depending on level",
          ageLimit: "18 - 33 Years",
          applicationStartDate: "September 2026",
          applicationEndDate: "October 2026",
          examDate: "December 2026 - January 2027",
          status: "Active",
          notificationUrl: "https://indianrailways.gov.in",
          applyUrl: "https://indianrailways.gov.in"
        },
        {
          title: "SSC Combined Higher Secondary Level (CHSL 10+2)",
          examAgency: "SSC",
          vacancies: "3,712 Posts",
          qualification: "12th Standard or equivalent",
          ageLimit: "18 - 27 Years",
          applicationStartDate: "April 2026",
          applicationEndDate: "May 2026",
          examDate: "July 2026",
          status: "Closed",
          notificationUrl: "https://ssc.gov.in",
          applyUrl: "https://ssc.gov.in"
        },
        {
          title: "Railway Recruitment Cell Group D (Level-1 Posts)",
          examAgency: "RRB",
          vacancies: "32,000+ Posts (Projected)",
          qualification: "10th Pass + ITI or equivalent",
          ageLimit: "18 - 33 Years",
          applicationStartDate: "October 2026",
          applicationEndDate: "November 2026",
          examDate: "Early 2027",
          status: "Upcoming",
          notificationUrl: "https://indianrailways.gov.in",
          applyUrl: "https://indianrailways.gov.in"
        }
      ];

      jobs = await JobAlert.insertMany(defaultJobs);
    }

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- GEMINI AI PERSONALIZED STUDY PLAN GENERATOR ---
app.post('/api/study-plan/generate', verifyToken, async (req, res) => {
  try {
    const { targetExam, weakSubjects, recentScore, accuracy } = req.body;

    if (!process.env.GEMINI_API_KEY || !genAI) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gemini API key is not configured on the server.' 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are the lead academic mentor at ShikshaIQ for competitive exams.
Student Profile:
- Target Exam: ${targetExam || 'SSC CGL'}
- Recent Test Score: ${recentScore ?? 'N/A'}
- Overall Accuracy: ${accuracy ?? 'N/A'}%
- Identified Weak Areas / Subjects: ${weakSubjects || 'Quantitative Aptitude, General Reasoning'}

Generate a crisp, practical, and highly targeted 7-day revision schedule in JSON format.
Your output must strictly be a JSON object with this shape:
{
  "focusSummary": "Short 2-sentence diagnosis of the student's preparation state.",
  "days": [
    {
      "day": "Day 1",
      "subject": "Name of subject",
      "topic": "Core topic to master",
      "targetQuestions": 40,
      "strategyTip": "Actionable shortcut, formula, or exam tip"
    }
  ]
}

Return ONLY raw JSON, with no markdown code blocks, no backticks, and no extra commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text().trim();

    // Clean up code block wrappers if any
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    const planData = JSON.parse(rawText);

    res.json({
      success: true,
      plan: planData
    });
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate personalized study plan.' 
    });
  }
});

// ==========================================
// 8. START EXPRESS SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Shiksha IQ Server running on port ${PORT}`);
});