require('dotenv').config();
const mongoose = require('mongoose');

// Define Question Schema matching your Mock Test engine
const questionSchema = new mongoose.Schema({
  exam: { type: String, required: true, index: true }, // 'SSC CGL', 'SSC CHSL', 'RRB NTPC'
  subject: { type: String, required: true, index: true }, // 'Quantitative Aptitude', 'Reasoning', 'General Awareness'
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }, // 0 to 3
  explanation: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate' },
  marks: { type: Number, default: 2 },
  negativeMarks: { type: Number, default: 0.5 },
  createdAt: { type: Date, default: Date.now }
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

const sampleQuestions = [
  // ==========================================
  // SECTION 1: QUANTITATIVE APTITUDE (17 Qs)
  // ==========================================
  {
    exam: "SSC CGL",
    subject: "Quantitative Aptitude",
    questionText: "If x + 1/x = 5, what is the value of x³ + 1/x³?",
    options: ["110", "125", "140", "115"],
    correctOptionIndex: 0,
    explanation: "Formula: x³ + 1/x³ = (x + 1/x)³ - 3(x + 1/x) = 5³ - 3(5) = 125 - 15 = 110.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Quantitative Aptitude",
    questionText: "A shopkeeper marks an article at 40% above the cost price and allows a discount of 25% on the marked price. What is his profit or loss percentage?",
    options: ["5% Profit", "5% Loss", "10% Profit", "8% Profit"],
    correctOptionIndex: 0,
    explanation: "Let CP = 100. MP = 140. SP = 140 × (1 - 0.25) = 105. Profit = SP - CP = 105 - 100 = 5%.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Quantitative Aptitude",
    questionText: "The ratio of speeds of two trains is 7:8. If the second train runs 400 km in 4 hours, what is the speed of the first train?",
    options: ["70 km/h", "75 km/h", "87.5 km/h", "80 km/h"],
    correctOptionIndex: 2,
    explanation: "Speed of second train = 400 / 4 = 100 km/h. Ratio = 7:8. Speed of first train = (7/8) × 100 = 87.5 km/h.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Quantitative Aptitude",
    questionText: "If sin θ + cos θ = √2 cos(90° - θ), find cot θ.",
    options: ["√2 - 1", "√2 + 1", "1/√2", "1"],
    correctOptionIndex: 0,
    explanation: "cos(90° - θ) = sin θ. So sin θ + cos θ = √2 sin θ => cos θ = (√2 - 1) sin θ => cot θ = √2 - 1.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Quantitative Aptitude",
    questionText: "A can complete a piece of work in 12 days and B in 18 days. If they work together for 4 days, what fraction of the work remains?",
    options: ["4/9", "5/9", "1/3", "2/9"],
    correctOptionIndex: 0,
    explanation: "LCM of (12, 18) = 36 units. Efficiency of A = 3, B = 2. Total efficiency = 5. In 4 days, completed = 20 units. Remaining = 16/36 = 4/9.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Quantitative Aptitude",
    questionText: "A sum of money doubles itself in 5 years at simple interest. In how many years will it become 4 times itself at the same rate?",
    options: ["10 years", "12 years", "15 years", "20 years"],
    correctOptionIndex: 2,
    explanation: "At SI, SI1 = P in 5 yrs. For 4 times, SI2 = 3P. Time required = 3 × 5 = 15 years.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Quantitative Aptitude",
    questionText: "The average age of 30 students in a class is 14 years. If the teacher's age is included, the average increases by 1 year. What is the teacher's age?",
    options: ["42 years", "45 years", "44 years", "46 years"],
    correctOptionIndex: 1,
    explanation: "Teacher's age = New Average + (Old Count × Increase) = 15 + (30 × 1) = 45 years.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Quantitative Aptitude",
    questionText: "The circumference of the base of a right circular cylinder is 44 cm and its height is 15 cm. Find its volume (use π = 22/7).",
    options: ["2310 cm³", "2150 cm³", "1980 cm³", "2420 cm³"],
    correctOptionIndex: 0,
    explanation: "2πr = 44 => r = 7 cm. Volume = πr²h = (22/7) × 7 × 7 × 15 = 22 × 105 = 2310 cm³.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Quantitative Aptitude",
    questionText: "If the difference between CI and SI on a certain sum for 2 years at 10% per annum is ₹65, what is the principal?",
    options: ["₹6,000", "₹6,500", "₹7,000", "₹6,250"],
    correctOptionIndex: 1,
    explanation: "Difference for 2 years = P × (R/100)² => 65 = P × (10/100)² => 65 = P × 0.01 => P = ₹6,500.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Quantitative Aptitude",
    questionText: "If a:b = 3:4 and b:c = 8:9, what is the ratio a:b:c?",
    options: ["3:8:9", "6:8:9", "3:4:9", "6:4:9"],
    correctOptionIndex: 1,
    explanation: "Multiply a:b by 2 => 6:8. Since b:c = 8:9, the combined ratio a:b:c is 6:8:9.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "RRB NTPC",
    subject: "Quantitative Aptitude",
    questionText: "Find the HCF of 36, 54, and 90.",
    options: ["12", "18", "6", "9"],
    correctOptionIndex: 1,
    explanation: "36 = 18 × 2, 54 = 18 × 3, 90 = 18 × 5. The highest common divisor is 18.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Quantitative Aptitude",
    questionText: "A 250 m long train crosses a pole in 15 seconds. What is the speed of the train in km/h?",
    options: ["54 km/h", "60 km/h", "48 km/h", "72 km/h"],
    correctOptionIndex: 1,
    explanation: "Speed in m/s = 250/15 = 50/3 m/s. In km/h = (50/3) × (18/5) = 60 km/h.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Quantitative Aptitude",
    questionText: "A pipe can fill an empty tank in 6 hours, while an outlet pipe can empty it in 8 hours. If both pipes are opened simultaneously, how long will it take to fill the tank?",
    options: ["18 hours", "24 hours", "20 hours", "12 hours"],
    correctOptionIndex: 1,
    explanation: "Net rate per hour = 1/6 - 1/8 = (4 - 3)/24 = 1/24. Time to fill = 24 hours.",
    difficulty: "Moderate",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Quantitative Aptitude",
    questionText: "What single discount is equivalent to two successive discounts of 20% and 10%?",
    options: ["30%", "28%", "25%", "26%"],
    correctOptionIndex: 1,
    explanation: "Equivalent discount = D1 + D2 - (D1 × D2)/100 = 20 + 10 - 200/100 = 30 - 2 = 28%.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Quantitative Aptitude",
    questionText: "The mean of the numbers 29, 36, 21, 18, 7, 19, k, k is 21.25. Find the value of k.",
    options: ["18", "20", "22", "25"],
    correctOptionIndex: 1,
    explanation: "Sum = 130 + 2k. Total numbers = 8. (130 + 2k)/8 = 21.25 => 130 + 2k = 170 => 2k = 40 => k = 20.",
    difficulty: "Moderate",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "SSC CGL",
    subject: "Quantitative Aptitude",
    questionText: "The perimeter of a quadrant of a circle of radius 14 cm is (use π = 22/7):",
    options: ["36 cm", "50 cm", "44 cm", "56 cm"],
    correctOptionIndex: 1,
    explanation: "Perimeter = 2r + (πr/2) = 2(14) + (22/7 × 14 / 2) = 28 + 22 = 50 cm.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "RRB NTPC",
    subject: "Quantitative Aptitude",
    questionText: "Find the least square number which is divisible by each of 10, 12, 15, and 18.",
    options: ["3600", "900", "1800", "2500"],
    correctOptionIndex: 1,
    explanation: "LCM(10, 12, 15, 18) = 180 = 2² × 3² × 5¹. To make it a perfect square, multiply by 5 => 180 × 5 = 900.",
    difficulty: "Moderate",
    marks: 1,
    negativeMarks: 0.33
  },

  // ==========================================
  // SECTION 2: LOGICAL REASONING (17 Qs)
  // ==========================================
  {
    exam: "SSC CGL",
    subject: "Reasoning",
    questionText: "Find the missing term in the series: 3, 9, 27, 81, 243, ?",
    options: ["626", "729", "512", "810"],
    correctOptionIndex: 1,
    explanation: "Each consecutive term is multiplied by 3 (powers of 3: 3¹, 3², 3³, 3⁴, 3⁵, 3⁶ = 729).",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Reasoning",
    questionText: "Select the option that is related to the third term in the same way as the second is related to the first: 6 : 42 :: 8 : ?",
    options: ["64", "72", "80", "90"],
    correctOptionIndex: 1,
    explanation: "Pattern: n : n(n + 1). 6 × 7 = 42. Similarly, 8 × 9 = 72.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Reasoning",
    questionText: "In a certain code language, 'ROSE' is written as 'ILHV'. How will 'HAND' be written in that code?",
    options: ["SZMW", "SZMV", "TZMW", "SYNW"],
    correctOptionIndex: 0,
    explanation: "Each letter is paired with its opposite alphabet position (A-Z, B-Y, etc.): H->S, A->Z, N->M, D->W. So 'SZMW'.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Reasoning",
    questionText: "Pointing to a photograph, Ramesh said, 'She is the daughter of my father's only son.' How is the girl related to Ramesh?",
    options: ["Sister", "Daughter", "Niece", "Mother"],
    correctOptionIndex: 1,
    explanation: "'My father's only son' is Ramesh himself. The daughter of Ramesh is his daughter.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "Reasoning",
    questionText: "Statements: All cars are four-wheelers. All four-wheelers are vehicles. Conclusions: I. All cars are vehicles. II. Some vehicles are four-wheelers.",
    options: ["Only I follows", "Only II follows", "Neither I nor II follows", "Both I and II follow"],
    correctOptionIndex: 3,
    explanation: "Since Cars ⊂ Four-wheelers ⊂ Vehicles, both conclusions logically follow directly from universal affirmatives.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Reasoning",
    questionText: "Find the odd one out from the given alternatives: 121, 169, 289, 324.",
    options: ["121", "169", "289", "324"],
    correctOptionIndex: 3,
    explanation: "121 (11²), 169 (13²), and 289 (17²) are squares of prime numbers. 324 (18²) is the square of a composite even number.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Reasoning",
    questionText: "Rohan walks 10 m East, turns left and walks 15 m, then turns right and walks 5 m. In which direction is he now facing?",
    options: ["North", "East", "South", "West"],
    correctOptionIndex: 1,
    explanation: "Facing East -> turns left (now facing North) -> turns right (now facing East).",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Reasoning",
    questionText: "If '+' means '÷', '-' means '×', '×' means '+', and '÷' means '-', then what is the value of: 36 × 12 - 4 ÷ 24 + 6?",
    options: ["80", "72", "40", "84"],
    correctOptionIndex: 0,
    explanation: "Replaced: 36 + 12 × 4 - 24 ÷ 6 = 36 + 48 - 4 = 84 - 4 = 80.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Reasoning",
    questionText: "Which of the following Venn diagrams represents the relationship among: Doctors, Surgeons, and Musicians?",
    options: ["All Surgeons are Doctors, and some of them can be Musicians", "Doctors and Musicians are disjoint", "Surgeons and Musicians cannot overlap", "None of these"],
    correctOptionIndex: 0,
    explanation: "All Surgeons are Doctors (proper subset). Some Doctors and Surgeons can also be Musicians (intersecting circle).",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "Reasoning",
    questionText: "Find the missing number in the sequence: 5, 11, 23, 47, 95, ?",
    options: ["189", "191", "190", "192"],
    correctOptionIndex: 1,
    explanation: "Pattern: ×2 + 1. (5×2+1=11; 11×2+1=23; 23×2+1=47; 47×2+1=95; 95×2+1 = 191).",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "RRB NTPC",
    subject: "Reasoning",
    questionText: "Select the INCORRECT letter-cluster in the given pattern: MNO, PQR, STU, WXY, ZAB.",
    options: ["MNO", "STU", "WXY", "ZAB"],
    correctOptionIndex: 2,
    explanation: "Consecutive triplets skipping 0 letters: MNO (+1 to P) PQR (+1 to S) STU (+1 to V). The sequence should have had VWX instead of WXY.",
    difficulty: "Moderate",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Reasoning",
    questionText: "In a certain code, 'sky is blue' is coded as 'mn pq rs', 'blue is water' is coded as 'pq rs tu', and 'water and sky' is coded as 'tu vw mn'. What is the code for 'and'?",
    options: ["mn", "pq", "tu", "vw"],
    correctOptionIndex: 3,
    explanation: "'sky' is mn, 'water' is tu. From 'water and sky' (tu vw mn), the remaining code for 'and' must be 'vw'.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Reasoning",
    questionText: "Given statements: K = P < C; P > Q; Q > L. Which conclusion is correct?",
    options: ["Both Q < C and K > L are true", "Only Q < C is true", "Only K > L is true", "Neither is true"],
    correctOptionIndex: 0,
    explanation: "Combining: L < Q < K = P < C. Hence Q < C is true and K > L is true. Both conclusions hold.",
    difficulty: "Moderate",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Reasoning",
    questionText: "Find the next number in the series: 1, 2, 6, 24, 120, ?",
    options: ["600", "720", "840", "500"],
    correctOptionIndex: 1,
    explanation: "Factorial series: 1×2=2, 2×3=6, 6×4=24, 24×5=120, 120×6=720.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "Reasoning",
    questionText: "If CLOCK is coded as KCOLC, then how will WATCH be coded?",
    options: ["HCTAW", "HCTWA", "HCATW", "HTCAW"],
    correctOptionIndex: 0,
    explanation: "The word is simply reversed: W-A-T-C-H backwards is H-C-T-A-W.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "SSC CGL",
    subject: "Reasoning",
    questionText: "Find the number of triangles in a standard pentagram (5-pointed star).",
    options: ["5", "10", "12", "8"],
    correctOptionIndex: 1,
    explanation: "A standard 5-pointed star contains 5 small triangles at the points plus 5 larger triangles formed by the intersection lines, totaling 10.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "RRB NTPC",
    subject: "Reasoning",
    questionText: "ACE is related to FHJ in a certain way based on alphabetical position. Which option is related to CEG following the same logic?",
    options: ["HKM", "HJN", "HJL", "GIK"],
    correctOptionIndex: 2,
    explanation: "A(+5)=F, C(+5)=H, E(+5)=J. Similarly: C(+5)=H, E(+5)=J, G(+5)=L => HJL.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },

  // ==========================================
  // SECTION 3: GENERAL AWARENESS (16 Qs)
  // ==========================================
  {
    exam: "SSC CGL",
    subject: "General Awareness",
    questionText: "Which Article of the Indian Constitution empowers the Supreme Court to issue writs for the enforcement of Fundamental Rights?",
    options: ["Article 226", "Article 32", "Article 143", "Article 131"],
    correctOptionIndex: 1,
    explanation: "Article 32 gives the right to constitutional remedies via Supreme Court writs (Habeas Corpus, Mandamus, etc.), famously called the 'Heart and Soul' of the Constitution by Dr. B.R. Ambedkar.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "General Awareness",
    questionText: "Who among the following was the founder of the Maurya Empire?",
    options: ["Ashoka", "Bindusara", "Chandragupta Maurya", "Pushyamitra Shunga"],
    correctOptionIndex: 2,
    explanation: "Chandragupta Maurya founded the Maurya Empire in 322 BCE with the strategic assistance of his mentor Chanakya (Kautilya).",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "General Awareness",
    questionText: "In which year was the Goods and Services Tax (GST) implemented in India?",
    options: ["2015", "2016", "2017", "2018"],
    correctOptionIndex: 2,
    explanation: "GST was implemented across India on July 1, 2017 through the 101st Constitutional Amendment Act.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "General Awareness",
    questionText: "Which hormone is commonly referred to as the 'fight-or-flight' hormone?",
    options: ["Thyroxine", "Insulin", "Adrenaline", "Melatonin"],
    correctOptionIndex: 2,
    explanation: "Adrenaline (epinephrine), secreted by the adrenal medulla, increases cardiac output and glucose levels during acute stress.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CGL",
    subject: "General Awareness",
    questionText: "The Tropic of Cancer does NOT pass through which of the following Indian states?",
    options: ["Rajasthan", "Chhattisgarh", "Odisha", "Tripura"],
    correctOptionIndex: 2,
    explanation: "The Tropic of Cancer passes through 8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram. It does not pass through Odisha.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "General Awareness",
    questionText: "What is the chemical name of Vitamin C?",
    options: ["Retinol", "Ascorbic acid", "Thiamine", "Calciferol"],
    correctOptionIndex: 1,
    explanation: "Vitamin C is chemically known as Ascorbic acid. Its deficiency leads to scurvy.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "General Awareness",
    questionText: "Who presided over the 1907 Surat Session of the Indian National Congress in which the party split into Moderates and Extremists?",
    options: ["Rash Behari Ghosh", "Dadabhai Naoroji", "Gopal Krishna Gokhale", "Bal Gangadhar Tilak"],
    correctOptionIndex: 0,
    explanation: "Dr. Rash Behari Ghosh was the president of the turbulent Surat session in December 1907.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "General Awareness",
    questionText: "Which layer of the atmosphere contains the ozone layer that absorbs harmful ultraviolet rays?",
    options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
    correctOptionIndex: 1,
    explanation: "The stratosphere contains the ozone layer (ozonosphere), located roughly 15 to 35 kilometers above Earth's surface.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "General Awareness",
    questionText: "The classical dance form 'Kathakali' originated in which Indian state?",
    options: ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh"],
    correctOptionIndex: 1,
    explanation: "Kathakali originated in the southwestern state of Kerala, celebrated for its elaborate makeup and stylized facial expressions.",
    difficulty: "Easy",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "SSC CHSL",
    subject: "General Awareness",
    questionText: "Which gland in the human body regulates calcium levels in the blood?",
    options: ["Pituitary gland", "Thyroid & Parathyroid glands", "Pancreas", "Adrenal gland"],
    correctOptionIndex: 1,
    explanation: "Parathyroid hormone (PTH) increases blood calcium levels while calcitonin from the thyroid gland lowers it.",
    difficulty: "Moderate",
    marks: 2,
    negativeMarks: 0.5
  },
  {
    exam: "RRB NTPC",
    subject: "General Awareness",
    questionText: "Where is the headquarters of the Indian Railway Board located?",
    options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    correctOptionIndex: 1,
    explanation: "The Railway Board is located at Rail Bhavan in New Delhi.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "General Awareness",
    questionText: "Which planet in our solar system is known as the 'Red Planet'?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctOptionIndex: 1,
    explanation: "Mars appears reddish due to the abundance of iron oxide (rust) on its surface.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "General Awareness",
    questionText: "What does HTTP stand for in computer networking?",
    options: ["HyperText Transfer Protocol", "High Transfer Text Procedure", "Hyperlink Transit Text Protocol", "Hybrid Text Telecommunication Program"],
    correctOptionIndex: 0,
    explanation: "HTTP stands for HyperText Transfer Protocol, the foundational protocol of the World Wide Web.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "General Awareness",
    questionText: "Who composed the national song of India, 'Vande Mataram'?",
    options: ["Rabindranath Tagore", "Bankim Chandra Chattopadhyay", "Sarojini Naidu", "Sri Aurobindo"],
    correctOptionIndex: 1,
    explanation: "'Vande Mataram' was penned by Bankim Chandra Chattopadhyay in his 1882 novel Anandamath.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "General Awareness",
    questionText: "What is the SI unit of electric current?",
    options: ["Volt", "Watt", "Ampere", "Ohm"],
    correctOptionIndex: 2,
    explanation: "The SI base unit of electric current is the Ampere (A).",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    exam: "RRB NTPC",
    subject: "General Awareness",
    questionText: "Which Indian national park is famous as the last refuge of the endangered One-horned Rhinoceros?",
    options: ["Jim Corbett National Park", "Kaziranga National Park", "Sundarbans National Park", "Gir National Park"],
    correctOptionIndex: 1,
    explanation: "Kaziranga National Park in Assam hosts two-thirds of the world's great one-horned rhinoceros population.",
    difficulty: "Easy",
    marks: 1,
    negativeMarks: 0.33
  }
];

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables. Check your .env file.");
    }

    console.log(" Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Connected successfully to MongoDB Atlas.");

    // Optional: clear existing questions if you want a clean seed
    const countBefore = await Question.countDocuments();
    console.log(` Existing questions in database: ${countBefore}`);

    // Insert questions
    console.log(` Inserting ${sampleQuestions.length} PYQ records...`);
    const inserted = await Question.insertMany(sampleQuestions);
    console.log(` Successfully seeded ${inserted.length} questions!`);

    const summary = await Question.aggregate([
      { $group: { _id: { exam: "$exam", subject: "$subject" }, count: { $sum: 1 } } }
    ]);

    console.log("\n--- Seed Summary by Exam & Subject ---");
    summary.forEach(item => {
      console.log(`• ${item._id.exam} [${item._id.subject}]: ${item.count} questions`);
    });

  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log(" MongoDB connection closed.\n");
    process.exit(0);
  }
}

seedDatabase();