const { GoogleGenAI } = require('@google/genai');
const CurrentAffair = require('../models/CurrentAffair');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateDailyAffairs() {
  try {
    const prompt = `
    Generate 5 distinct, high-yield current affairs exam capsules for competitive exams (SSC, Banking, Railways) for today.
    Include categories: National, International, Economy, Science & Tech, and Sports.
    Return ONLY a valid JSON array of objects with this exact structure:
    [
      {
        "title": "String",
        "category": "National | International | Economy | Science & Tech | Sports",
        "date": "September 5, 2026",
        "summary": "Detailed summary paragraph...",
        "bulletPoints": ["Point 1", "Point 2", "Point 3"],
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
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    let textResponse = response.text.trim();
    // Clean markdown code block syntax if present
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    const newCapsules = JSON.parse(textResponse);

    // Save generated capsules into MongoDB
    for (const cap of newCapsules) {
      // Avoid duplicate entries by title check
      const exists = await CurrentAffair.findOne({ title: cap.title });
      if (!exists) {
        await CurrentAffair.create(cap);
      }
    }
    console.log('Successfully generated and updated daily current affairs via Gemini!');
  } catch (error) {
    console.error('Error auto-generating current affairs with Gemini:', error);
  }
}

module.exports = { generateDailyAffairs };