import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateScorecardPDF = ({ quiz, result, user }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const studentName = user?.name || 'Rahul Sharma';
  const targetExam = user?.targetExam || 'SSC & Railway';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Helper to draw the persistent header on every page
  const drawHeader = (pageNumber) => {
    doc.setFillColor(15, 23, 42); // Navy Blue (#0F172A)
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Shiksha', 14, 15);

    // Orange Accent
    doc.setTextColor(234, 88, 12); // Orange (#EA580C)
    doc.text('IQ', 36, 15);

    // Subtitle
doc.setFontSize(8);
doc.setTextColor(251, 146, 60); // Bright Orange/Gold accent
doc.setFont('helvetica', 'bold');
doc.text('LEARN SMART • RANK HIGHER', 44, 15);
  };

  // --- PAGE 1: OVERVIEW & SCORECARD ---
  drawHeader(1);

  // Exam Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(quiz.title, 14, 34);

  // Student Metadata Table
  autoTable(doc, {
    startY: 38,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 1.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 62 },
      2: { fontStyle: 'bold', cellWidth: 28 },
      3: { cellWidth: 62 },
    },
    body: [
      ['Student Name:', studentName, 'Target Exam:', targetExam],
      [
        'Total Questions:',
        `${quiz.totalQuestions} Questions`,
        'Time Consumed:',
        `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`,
      ],
    ],
  });

  // Metrics Table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 3,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8.5,
    },
    bodyStyles: {
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 11,
    },
    head: [['Final Score', 'Accuracy Rate', 'Correct', 'Incorrect', 'Unattempted']],
    body: [
      [
        `${result.score} / ${result.totalMarks}`,
        `${result.accuracy}%`,
        result.correctAnswers,
        result.wrongAnswers,
        result.unattempted,
      ],
    ],
  });

  // Section Heading for Gemini Full Description
  let currentY = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Question-by-Question AI Pedagogical Analysis', 14, currentY);

  // --- RENDER FULL GEMINI DESCRIPTIONS FOR EACH QUESTION ---
  result.analysis.forEach((q, idx) => {
    // Check if we need a new page
    if (currentY > pageHeight - 55) {
      doc.addPage();
      drawHeader(doc.internal.getNumberOfPages());
      currentY = 32;
    }

    // Status Pill calculation
    let statusText = 'UNATTEMPTED (0.0 Marks)';
    let statusColor = [100, 116, 139]; // Slate
    if (q.status === 'correct') {
      statusText = 'CORRECT (+2.0 Marks)';
      statusColor = [16, 185, 129]; // Emerald
    } else if (q.status === 'wrong') {
      statusText = 'INCORRECT (-0.5 Marks)';
      statusColor = [239, 68, 68]; // Red
    }

    const selectedOptText =
      q.selectedOptionIndex !== null && q.selectedOptionIndex !== undefined
        ? `${String.fromCharCode(65 + q.selectedOptionIndex)}) ${q.options[q.selectedOptionIndex]}`
        : 'Not Attempted';

    const correctOptText = `${String.fromCharCode(65 + q.correctOptionIndex)}) ${q.options[q.correctOptionIndex]}`;

    // Question Header Box
    autoTable(doc, {
      startY: currentY + 3,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 15, textColor: [234, 88, 12] },
        1: { cellWidth: 125, textColor: [15, 23, 42], fontStyle: 'bold' },
        2: { cellWidth: 44, halign: 'right', fontStyle: 'bold' },
      },
      body: [[`Q${idx + 1}.`, q.questionText, statusText]],
      didParseCell: (data) => {
        if (data.column.index === 2) {
          data.cell.styles.textColor = statusColor;
        }
      },
    });

    // Options and Answers Comparison Row
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 1,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 92, textColor: [71, 85, 105] },
        1: { cellWidth: 92, textColor: [16, 185, 129], fontStyle: 'bold' },
      },
      head: [['Your Selected Option', 'Official Correct Answer']],
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 7.5 },
      body: [[selectedOptText, correctOptText]],
    });

    // Gemini AI Full Comprehensive Explanation Block
    const cleanAiDescription = (q.aiDescription || q.explanation || 'Standard conceptual verified solution.')
      .replace(/\*\*/g, '')
      .replace(/###/g, '')
      .trim();

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 1.5,
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        cellPadding: 3,
        textColor: [30, 41, 59],
        lineHeightFactor: 1.3,
        fillColor: [248, 250, 252], // Slate-50 background for explanation
      },
      body: [[`[Gemini AI Detailed Solution & Method Breakdown]\n${cleanAiDescription}`]],
    });

    currentY = doc.lastAutoTable.finalY + 4;
  });

  // --- FOOTER & PAGE NUMBERING ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Shiksha IQ • LEARN SMART • RANK HIGHER • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Trigger Save
  const cleanTitle = quiz.title.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${cleanTitle}_Full_AI_Scorecard.pdf`);
};