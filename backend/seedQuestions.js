require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force public Google DNS for Atlas SRV records
const mongoose = require('mongoose');

// Mongoose Question Schema definition (mirrors backend Question model)
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

const SEED_QUESTIONS = [
  // ==========================================
  // QUANTITATIVE APTITUDE
  // ==========================================
  {
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: 'Algebra',
    difficulty: 'Easy',
    questionText: 'If x + 1/x = 5, find the value of x² + 1/x².',
    options: ['23', '25', '27', '21'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Using identity: x² + 1/x² = (x + 1/x)² - 2 = 5² - 2 = 25 - 2 = 23.',
    year: 2023
  },
  {
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: 'Algebra',
    difficulty: 'Moderate',
    questionText: 'If x + 1/x = 3, what is the value of x³ + 1/x³?',
    options: ['18', '27', '24', '21'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Using identity: x³ + 1/x³ = k³ - 3k where k = 3. Thus, 3³ - 3(3) = 27 - 9 = 18.',
    year: 2024
  },
  {
    exam: 'RRB NTPC',
    subject: 'Quantitative Aptitude',
    topic: 'Compound Interest',
    difficulty: 'Moderate',
    questionText: 'The difference between Compound Interest and Simple Interest on a sum of ₹10,000 for 2 years at 10% per annum is:',
    options: ['₹50', '₹100', '₹150', '₹200'],
    correctOptionIndex: 1,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Difference for 2 years = P × (R / 100)² = 10,000 × (10 / 100)² = 10,000 × (1/100) = ₹100.',
    year: 2022
  },
  {
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: 'Geometry',
    difficulty: 'Moderate',
    questionText: 'In an equilateral triangle of side 12 cm, find the radius of the incircle (inradius).',
    options: ['2√3 cm', '3√3 cm', '4√3 cm', '6 cm'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Inradius of an equilateral triangle r = a / (2√3). Here a = 12 cm, so r = 12 / (2√3) = 6 / √3 = 2√3 cm.',
    year: 2023
  },
  {
    exam: 'RRB NTPC',
    subject: 'Quantitative Aptitude',
    topic: 'Profit & Loss',
    difficulty: 'Easy',
    questionText: 'A shopkeeper marks an article 25% above the cost price and gives a discount of 10%. Find his overall profit percentage.',
    options: ['12.5%', '15%', '10%', '17.5%'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Let CP = 100. Marked Price MP = 125. Selling Price SP = 125 × (90/100) = 112.5. Profit = 112.5 - 100 = 12.5%.',
    year: 2022
  },
  {
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: 'Time and Work',
    difficulty: 'Moderate',
    questionText: 'A can complete a piece of work in 12 days and B in 18 days. If they work together for 4 days, what fraction of work is left?',
    options: ['4/9', '5/9', '2/9', '1/3'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Total work = LCM(12, 18) = 36 units. Efficiency of A = 3 units/day, B = 2 units/day. Combined in 4 days = 4 × (3 + 2) = 20 units. Remaining work = 36 - 20 = 16 units. Fraction left = 16/36 = 4/9.',
    year: 2024
  },
  {
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: 'Trigonometry',
    difficulty: 'Easy',
    questionText: 'What is the maximum value of 5 sin θ + 12 cos θ?',
    options: ['13', '17', '7', '12'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Maximum value of a sin θ + b cos θ is √(a² + b²) = √(5² + 12²) = √(25 + 144) = √169 = 13.',
    year: 2023
  },
  {
    exam: 'RRB NTPC',
    subject: 'Quantitative Aptitude',
    topic: 'Speed, Time and Distance',
    difficulty: 'Easy',
    questionText: 'A train 150 meters long crosses a telegraph pole in 9 seconds. What is the speed of the train in km/h?',
    options: ['50 km/h', '60 km/h', '54 km/h', '45 km/h'],
    correctOptionIndex: 1,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Speed = Distance / Time = 150 / 9 m/s. Convert to km/h by multiplying with 18/5: (150 / 9) × (18 / 5) = (150 / 5) × (18 / 9) = 30 × 2 = 60 km/h.',
    year: 2021
  },

  // ==========================================
  // GENERAL REASONING & INTELLIGENCE
  // ==========================================
  {
    exam: 'SSC CGL',
    subject: 'Reasoning',
    topic: 'Clock',
    difficulty: 'Moderate',
    questionText: 'What is the angle between the hour hand and minute hand of a clock at 4:20?',
    options: ['10°', '0°', '15°', '20°'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Angle θ = | 30H - (11/2)M |. For 4:20: θ = | 30(4) - (11/2)(20) | = | 120 - 110 | = 10°.',
    year: 2023
  },
  {
    exam: 'RRB NTPC',
    subject: 'Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'Easy',
    questionText: 'If in a certain code language, "TEACHER" is written as "VGCEJGT", how is "CHILDREN" written in that code?',
    options: ['EJKNFTGP', 'EJKNFPGT', 'EKJNFTGP', 'EJKTGPNF'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Each letter is shifted by +2 positions in the alphabet: C(+2)->E, H(+2)->J, I(+2)->K, L(+2)->N, D(+2)->F, R(+2)->T, E(+2)->G, N(+2)->P.',
    year: 2022
  },
  {
    exam: 'SSC CGL',
    subject: 'Reasoning',
    topic: 'Direction Sense',
    difficulty: 'Easy',
    questionText: 'A person walks 10 km North, turns right and walks 6 km, then turns right again and walks 10 km. How far is he from his initial starting point?',
    options: ['6 km', '10 km', '16 km', '8 km'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'The movement forms a rectangle. Moving 10 km North and then 10 km South brings him back to the horizontal baseline, exactly 6 km East of the origin.',
    year: 2023
  },
  {
    exam: 'SSC CGL',
    subject: 'Reasoning',
    topic: 'Calendar',
    difficulty: 'Moderate',
    questionText: 'If 15th August 2021 was Sunday, what day of the week was 15th August 2022?',
    options: ['Monday', 'Tuesday', 'Sunday', 'Saturday'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: '2021 to 2022 is a normal year (non-leap), which has 365 days = 52 weeks + 1 odd day. Sunday + 1 day = Monday.',
    year: 2023
  },
  {
    exam: 'RRB NTPC',
    subject: 'Reasoning',
    topic: 'Number Series',
    difficulty: 'Easy',
    questionText: 'Find the missing number in the series: 7, 14, 28, 56, ?',
    options: ['112', '102', '118', '98'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'The pattern is multiplying each preceding number by 2: 7×2=14, 14×2=28, 28×2=56, 56×2=112.',
    year: 2021
  },

  // ==========================================
  // GENERAL AWARENESS & SCIENCE
  // ==========================================
  {
    exam: 'SSC CGL',
    subject: 'General Awareness',
    topic: 'Indian Polity',
    difficulty: 'Easy',
    questionText: 'Which Article of the Indian Constitution is termed as the "Heart and Soul of the Constitution" by Dr. B.R. Ambedkar?',
    options: ['Article 32', 'Article 21', 'Article 14', 'Article 19'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Article 32 provides the Right to Constitutional Remedies, empowering citizens to approach the Supreme Court for enforcement of Fundamental Rights.',
    year: 2024
  },
  {
    exam: 'RRB NTPC',
    subject: 'General Awareness',
    topic: 'General Science',
    difficulty: 'Easy',
    questionText: 'Which vitamin is synthesized in the human skin in the presence of sunlight?',
    options: ['Vitamin D', 'Vitamin A', 'Vitamin C', 'Vitamin K'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'When skin is exposed to UVB radiation from sunlight, 7-dehydrocholesterol is converted to previtamin D3, which then becomes active Vitamin D (Cholecalciferol).',
    year: 2022
  },
  {
    exam: 'SSC CGL',
    subject: 'General Awareness',
    topic: 'Indian History',
    difficulty: 'Moderate',
    questionText: 'During the reign of which Mughal emperor was the Jizya tax reimposed on non-Muslims in 1679?',
    options: ['Aurangzeb', 'Akbar', 'Shah Jahan', 'Jahangir'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Akbar abolished Jizya in 1564, but it was reimposed by the sixth Mughal emperor Aurangzeb (Alamgir) in the year 1679.',
    year: 2023
  },
  {
    exam: 'RRB NTPC',
    subject: 'General Awareness',
    topic: 'Geography',
    difficulty: 'Easy',
    questionText: 'Which line of latitude passes almost through the middle of India?',
    options: ['Tropic of Cancer', 'Equator', 'Tropic of Capricorn', 'Arctic Circle'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'The Tropic of Cancer (23°30\' N) passes through 8 Indian states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.',
    year: 2022
  },
  {
    exam: 'SSC CGL',
    subject: 'General Awareness',
    topic: 'Economics',
    difficulty: 'Moderate',
    questionText: 'What term describes inflation accompanied by stagnant economic growth and high unemployment?',
    options: ['Stagflation', 'Deflation', 'Hyperinflation', 'Reflation'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'Stagflation is an economic condition characterized by slow economic growth, relatively high unemployment, and rising consumer price inflation simultaneously.',
    year: 2024
  },

  // ==========================================
  // ENGLISH COMPREHENSION
  // ==========================================
  {
    exam: 'SSC CGL',
    subject: 'English Comprehension',
    topic: 'Idioms and Phrases',
    difficulty: 'Easy',
    questionText: 'Select the most appropriate meaning of the given idiom: "Spill the beans"',
    options: ['Reveal a secret prematurely', 'Create unnecessary confusion', 'Drop food on the floor', 'Waste valuable resources'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: '"Spill the beans" is an informal idiom meaning to disclose confidential information inadvertently or prematurely.',
    year: 2024
  },
  {
    exam: 'SSC CGL',
    subject: 'English Comprehension',
    topic: 'One Word Substitution',
    difficulty: 'Easy',
    questionText: 'A person who compiles dictionaries is called a:',
    options: ['Lexicographer', 'Calligrapher', 'Cartographer', 'Bibliophile'],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: 'A lexicographer is an author or editor of a dictionary. A cartographer draws maps, a calligrapher practices decorative handwriting, and a bibliophile loves books.',
    year: 2023
  }
];

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('ERROR: MONGO_URI is missing in your backend .env file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Count existing questions
    const existingCount = await Question.countDocuments();
    console.log(`Current questions in database: ${existingCount}`);

    // Insert only if not already present based on question text
    let inserted = 0;
    for (const q of SEED_QUESTIONS) {
      const exists = await Question.findOne({ questionText: q.questionText });
      if (!exists) {
        await Question.create(q);
        inserted++;
      }
    }

    const updatedCount = await Question.countDocuments();
    console.log(`Database Seeding Complete!`);
    console.log(`Newly inserted questions: ${inserted}`);
    console.log(`Total questions in Question Bank: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
}

seedDatabase();