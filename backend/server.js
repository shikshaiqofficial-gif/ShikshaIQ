const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// Mongoose Models
const User = require('./models/User');
const { JobAlert, CurrentAffairs } = require('./models/Content');
const Doubt = require('./models/Doubt');
const { Quiz, QuizAttempt } = require('./models/Quiz');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'shiksha_iq_dev_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Multer in-memory storage for AI question image uploads (5MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Initialize Gemini Client (reads GEMINI_API_KEY from process.env)
const ai = new GoogleGenAI({});

// MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('🍃 MongoDB Atlas Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// Helper: Generate JWT with Role claim
const generateToken = (userId, email, role) => {
  return jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Shiksha IQ Backend API' });
});

// ================= AUTHENTICATION ROUTES =================

// Register Student
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, targetExam } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      targetExam: targetExam || 'General',
      role: 'student',
      provider: 'email',
    });

    const token = generateToken(newUser._id, newUser.email, newUser.role);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        targetExam: newUser.targetExam,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.email, user.role);
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetExam: user.targetExam,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Protected Profile & Dashboard Metrics
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Access denied.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({
      success: true,
      user,
      dashboardStats: {
        streakDays: 4,
        testsAttempted: 12,
        overallAccuracy: 84.5,
        solvedDoubts: 19,
        allIndiaRank: 'Top 5%',
      },
    });
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
});

// ================= JOB ALERTS ROUTES =================

app.get('/api/jobs', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await JobAlert.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/jobs/seed', async (req, res) => {
  try {
    await JobAlert.deleteMany({});
    const sampleJobs = [
      {
        title: 'RRB NTPC Graduate & Undergraduate Posts',
        organization: 'Railway Recruitment Boards (RRB)',
        category: 'Railways',
        vacancies: 11558,
        qualification: 'Graduate / 12th Pass',
        lastDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        salary: '₹19,900 - ₹35,400 (Level 2 to 6)',
        applyUrl: 'https://rrbapply.gov.in',
      },
      {
        title: 'SSC Combined Graduate Level (CGL) 2026',
        organization: 'Staff Selection Commission (SSC)',
        category: 'SSC',
        vacancies: 14500,
        qualification: "Bachelor's Degree in any discipline",
        lastDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        salary: '₹25,500 - ₹1,42,400',
        applyUrl: 'https://ssc.gov.in',
      },
      {
        title: 'IBPS Probationary Officer (PO/MT) XIV',
        organization: 'Institute of Banking Personnel Selection',
        category: 'Banking',
        vacancies: 3955,
        qualification: 'Graduation in Any Stream',
        lastDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        salary: '₹52,000 - ₹55,000 in-hand',
        applyUrl: 'https://ibps.in',
      },
      {
        title: 'UPSC Combined Defence Services (CDS II)',
        organization: 'Union Public Service Commission',
        category: 'Defence',
        vacancies: 459,
        qualification: 'Degree / Engineering for IAF',
        lastDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        salary: '₹56,100 (Level 10)',
        applyUrl: 'https://upsconline.nic.in',
      },
    ];
    await JobAlert.insertMany(sampleJobs);
    res.json({ success: true, message: 'Sample jobs seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= DAILY CURRENT AFFAIRS ROUTES =================

app.get('/api/current-affairs', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const affairs = await CurrentAffairs.find(query).sort({ date: -1 }).limit(50);
    res.json({ success: true, count: affairs.length, data: affairs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/current-affairs/seed', async (req, res) => {
  try {
    await CurrentAffairs.deleteMany({});
    const sampleNews = [
      {
        title: 'ISRO Announces Next-Generation Launch Vehicle (NGLV) Architecture',
        summary: 'ISRO has finalized the baseline configuration for the NGLV (Soorya), featuring reusable booster stages designed to significantly reduce payload delivery costs to Low Earth Orbit.',
        category: 'Science & Tech',
        tags: ['ISRO', 'Space', 'NGLV'],
        readTimeMinutes: 2,
      },
      {
        title: 'RBI Keeps Repo Rate Steady to Anchor Inflationary Expectations',
        summary: 'The Monetary Policy Committee (MPC) voted unanimously to keep the policy repo rate unchanged, emphasizing sustainable growth while aligning CPI inflation with the target.',
        category: 'Economy',
        tags: ['RBI', 'Economy', 'Repo Rate'],
        readTimeMinutes: 3,
      },
      {
        title: 'India Inaugurates Strategic High-Altitude Border Tunnel Network',
        summary: 'A new twin-tube tunnel system was inaugurated in the northern sector, enabling 365-day seamless troop and civilian mobility across snow-bound passes.',
        category: 'National',
        tags: ['Infrastructure', 'National Security', 'Border Roads'],
        readTimeMinutes: 2,
      },
      {
        title: 'National Sports Awards 2026: Outstanding Athletes Honored',
        summary: 'The Ministry of Youth Affairs and Sports announced the list of Khel Ratna and Arjuna awardees for consistent international podium performances.',
        category: 'Sports',
        tags: ['Sports Awards', 'Arjuna Award'],
        readTimeMinutes: 2,
      },
    ];
    await CurrentAffairs.insertMany(sampleNews);
    res.json({ success: true, message: 'Sample current affairs seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= AI DOUBT SOLVER ROUTE =================

app.post('/api/doubts/solve', upload.single('image'), async (req, res) => {
  try {
    const { questionText, subject } = req.body;
    const file = req.file;

    if (!questionText && !file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a question description or upload an image.',
      });
    }

    const systemInstruction = `
You are the master AI Educator at 'Shiksha IQ', an elite learning platform for Indian competitive exams (SSC, Railway, Banking, UPSC, Defence).
Analyze the student's question and structure your response strictly as follows:
1. **Target Topic & Concept Identified**: State the exact formula or concept applied.
2. **Step-by-Step Mathematical/Logical Derivation**: Explain clearly, line by line.
3. **Final Verified Answer**: Highlight with option (if multiple-choice).
4. **Pro-Tip / Shortcut Method**: Provide an exam trick or time-saver if applicable.
Keep tone encouraging, concise, professional, and crisp.
`;

    const contents = [];

    if (file) {
      contents.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString('base64'),
        },
      });
    }

    const textPrompt = `Subject: ${subject || 'General Competitive Prep'}\n\nQuestion:\n${
      questionText || 'Please read and solve the attached question image completely.'
    }`;
    contents.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    const aiSolution = response.text || 'Unable to generate solution at this time.';

    const record = await Doubt.create({
      questionText: questionText || '[Photo Query]',
      hasImage: !!file,
      subject: subject || 'General',
      solution: aiSolution,
    });

    return res.status(200).json({
      success: true,
      solution: aiSolution,
      id: record._id,
    });
  } catch (error) {
    console.error('AI Solver Error:', error);
    return res.status(500).json({
      success: false,
      message: 'AI Solver encountered an error: ' + error.message,
    });
  }
});

// ================= MOCK TEST ROUTES =================

app.get('/api/mock-test/today', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!quiz) return res.status(404).json({ success: false, message: 'No active quiz found.' });

    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
    }));

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        durationMinutes: quiz.durationMinutes,
        totalQuestions: sanitizedQuestions.length,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit Mock Test with Gemini AI Explanations for Scorecard PDF
app.post('/api/mock-test/submit', async (req, res) => {
  try {
    const { quizId, answers, timeTakenSeconds, userId } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    // 1. Calculate Score & Status
    const basicAnalysis = quiz.questions.map((q) => {
      totalMarks += q.marks;
      const selected = answers ? answers[q._id.toString()] : undefined;
      let isCorrect = false;
      let status = 'unattempted';

      if (selected !== undefined && selected !== null) {
        if (selected === q.correctOptionIndex) {
          score += q.marks;
          correctCount++;
          isCorrect = true;
          status = 'correct';
        } else {
          score -= q.negativeMarks;
          wrongCount++;
          status = 'wrong';
        }
      } else {
        unattemptedCount++;
      }

      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        selectedOptionIndex: selected ?? null,
        status,
        isCorrect,
        baseExplanation: q.explanation || '',
      };
    });

    // 2. Generate Detailed AI Breakdown via Gemini for each question
    const detailedAnalysis = await Promise.all(
      basicAnalysis.map(async (item, idx) => {
        try {
          const prompt = `
You are the master competitive exam faculty at Shiksha IQ.
Provide a clear, rich, pedagogical explanation for this exam question so a student can review it in their official PDF scorecard.

Question: ${item.questionText}
Options:
A) ${item.options[0]}
B) ${item.options[1]}
C) ${item.options[2]}
D) ${item.options[3]}

Correct Option: ${String.fromCharCode(65 + item.correctOptionIndex)}) ${item.options[item.correctOptionIndex]}
Student's Status: ${item.status.toUpperCase()}

Structure your output in clean text with these sections (do NOT use markdown asterisks like **):
• Core Concept Applied: (1-2 sentences)
• Step-by-Step Mathematical/Logical Derivation: (Line-by-line clear proof)
• Why Other Options Are Incorrect: (Brief elimination note)
• Pro-Tip / Exam Time Saver: (Formula trick or mental calculation shortcut)
`;

          const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: prompt }],
            config: {
              temperature: 0.2,
            },
          });

          return {
            ...item,
            aiDescription: aiResponse.text || item.baseExplanation || 'Detailed solution verified.',
          };
        } catch (aiErr) {
          console.error(`AI explanation error for Q${idx + 1}:`, aiErr.message);
          return {
            ...item,
            aiDescription: item.baseExplanation || 'Standard verified answer key.',
          };
        }
      })
    );

    const attemptedTotal = correctCount + wrongCount;
    const accuracy = attemptedTotal > 0 ? ((correctCount / attemptedTotal) * 100).toFixed(1) : 0;
    const finalScore = Math.max(0, score);

    await QuizAttempt.create({
      quizId,
      userId: userId || 'guest',
      score: finalScore,
      totalMarks,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unattempted: unattemptedCount,
      accuracy,
      timeTakenSeconds,
    });

    res.json({
      success: true,
      result: {
        score: finalScore,
        totalMarks,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unattempted: unattemptedCount,
        accuracy: Number(accuracy),
        timeTakenSeconds,
        analysis: detailedAnalysis,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/mock-test/seed', async (req, res) => {
  try {
    await Quiz.deleteMany({});
    const sampleQuiz = {
      title: 'Daily Mock Test #42: Quantitative Aptitude & General Intelligence',
      targetExam: 'SSC & Railway',
      durationMinutes: 10,
      questions: [
        {
          questionText: 'A train 180 meters long crosses a platform of length 220 meters in 20 seconds. What is the speed of the train in km/h?',
          options: ['54 km/h', '72 km/h', '64 km/h', '80 km/h'],
          correctOptionIndex: 1,
          explanation: 'Total distance = 180 + 220 = 400 m. Speed = 400 / 20 = 20 m/s = 20 * (18/5) = 72 km/h.',
          marks: 2,
          negativeMarks: 0.5,
        },
        {
          questionText: 'Which planet in our solar system is known as the "Red Planet"?',
          options: ['Venus', 'Saturn', 'Mars', 'Jupiter'],
          correctOptionIndex: 2,
          explanation: 'Mars is known as the Red Planet due to iron oxide on its surface.',
          marks: 2,
          negativeMarks: 0.5,
        },
        {
          questionText: 'Find the missing number in the series: 4, 9, 19, 39, 79, ?',
          options: ['159', '149', '169', '139'],
          correctOptionIndex: 0,
          explanation: 'Pattern is (x * 2) + 1. 79 * 2 + 1 = 159.',
          marks: 2,
          negativeMarks: 0.5,
        },
        {
          questionText: 'Who among the following was the first Chief Election Commissioner of India?',
          options: ['Sukumar Sen', 'K.V.K. Sundaram', 'T.N. Seshan', 'Sunil Arora'],
          correctOptionIndex: 0,
          explanation: 'Sukumar Sen served as the first Chief Election Commissioner from 1950 to 1958.',
          marks: 2,
          negativeMarks: 0.5,
        },
      ],
    };
    await Quiz.create(sampleQuiz);
    res.json({ success: true, message: 'Mock test seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= ADMIN MIDDLEWARE & MANAGEMENT ROUTES =================

// Middleware: Verify JWT and Admin Role
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have administrator privileges.',
      });
    }

    req.user = decoded;
    next();
  });
};

// 1. Admin Jobs
app.post('/api/admin/jobs', verifyAdmin, async (req, res) => {
  try {
    const job = await JobAlert.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/jobs/:id', verifyAdmin, async (req, res) => {
  try {
    await JobAlert.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job alert deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 2. Admin Current Affairs
app.post('/api/admin/current-affairs', verifyAdmin, async (req, res) => {
  try {
    const news = await CurrentAffairs.create(req.body);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/current-affairs/:id', verifyAdmin, async (req, res) => {
  try {
    await CurrentAffairs.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Current affairs item deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 3. Admin Mock Tests
app.post('/api/admin/mock-tests', verifyAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/mock-tests/:id', verifyAdmin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Mock test deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ================= ALL-INDIA LEADERBOARD ROUTES =================

// 1. Get Global Leaderboard with Top Scorers & User Percentile
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { exam } = req.query; // optional filter: 'SSC & Railway', 'Banking', etc.

    // Aggregate attempts by user to compute cumulative score, avg accuracy, and tests taken
    const pipeline = [
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          totalAttempts: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracy' },
          bestScore: { $max: '$score' },
          lastAttemptDate: { $max: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (exam && exam !== 'All') {
      pipeline.push({ $match: { 'user.targetExam': exam } });
    }

    // Sort by Total Score descending, then by Accuracy descending
    pipeline.push(
      { $sort: { totalScore: -1, avgAccuracy: -1 } },
      {
        $project: {
          _id: 1,
          totalScore: 1,
          totalAttempts: 1,
          avgAccuracy: { $round: ['$avgAccuracy', 1] },
          bestScore: 1,
          name: '$user.name',
          targetExam: '$user.targetExam',
          email: '$user.email',
        },
      }
    );

    const rankings = await QuizAttempt.aggregate(pipeline);
    const totalStudents = rankings.length;

    // Attach rank and percentile to each student
    const rankedList = rankings.map((student, idx) => {
      const rank = idx + 1;
      const percentile =
        totalStudents > 1
          ? Number((((totalStudents - rank) / (totalStudents - 1)) * 100).toFixed(1))
          : 99.9;

      return {
        ...student,
        rank,
        percentile,
      };
    });

    res.json({
      success: true,
      totalParticipants: totalStudents,
      leaderboard: rankedList.slice(0, 50), // Return top 50
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Specific Quiz Leaderboard (Test-specific ranks)
app.get('/api/leaderboard/quiz/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempts = await QuizAttempt.find({ quizId })
      .populate('userId', 'name email targetExam')
      .sort({ score: -1, timeTakenSeconds: 1 })
      .limit(50);

    const total = await QuizAttempt.countDocuments({ quizId });

    const ranked = attempts.map((att, idx) => {
      const rank = idx + 1;
      const percentile =
        total > 1 ? Number((((total - rank) / (total - 1)) * 100).toFixed(1)) : 99.9;

      return {
        attemptId: att._id,
        rank,
        percentile,
        score: att.score,
        accuracy: att.accuracy,
        timeTakenSeconds: att.timeTakenSeconds,
        user: att.userId,
      };
    });

    res.json({
      success: true,
      totalParticipants: total,
      leaderboard: ranked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Shiksha IQ Server running on http://localhost:${PORT}`));