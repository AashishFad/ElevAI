/**
 * ElevAI — PDF Project Report Generator
 * Converts the comprehensive project report into a formatted PDF document.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generatePdfReport() {
  const mdPath = path.join(__dirname, '../../ELEVAI_FINAL_PROJECT_REPORT.md');
  const pdfPath = path.join(__dirname, '../../ELEVAI_FINAL_PROJECT_REPORT.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('Source markdown file not found:', mdPath);
    return;
  }

  const content = fs.readFileSync(mdPath, 'utf-8');
  const lines = content.split('\n');

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'ElevAI — AI-Powered Smart Interview & Career Preparation Portal',
      Author: 'BCA Final Year Project',
      Subject: 'Final Project Documentation & Comprehensive Report',
      Keywords: 'ElevAI, AI, React, Node.js, Express, Supabase, Gemini AI, BCA Project',
    },
  });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  let isCodeBlock = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith('```')) {
      if (isCodeBlock) {
        // End code block
        isCodeBlock = false;
        doc.fontSize(8.5).font('Courier').fillColor('#334155');
        const codeText = codeBuffer.join('\n');
        doc.text(codeText, { indent: 15, lineGap: 1.5 });
        doc.moveDown(0.8);
        codeBuffer = [];
      } else {
        isCodeBlock = true;
        codeBuffer = [];
      }
      continue;
    }

    if (isCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Handle Headings
    if (line.startsWith('# ')) {
      doc.addPage();
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#0F172A');
      doc.text(line.replace('# ', '').trim(), { underline: true });
      doc.moveDown(0.8);
    } else if (line.startsWith('## ')) {
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1E293B');
      doc.text(line.replace('## ', '').trim());
      doc.moveDown(0.5);
    } else if (line.startsWith('### ')) {
      doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#334155');
      doc.text(line.replace('### ', '').trim());
      doc.moveDown(0.3);
    } else if (line.startsWith('---')) {
      doc.moveDown(0.5);
      doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
      doc.text(`•  ${line.substring(2).trim()}`, { indent: 10, lineGap: 2 });
      doc.moveDown(0.2);
    } else if (line.startsWith('|')) {
      // Table row
      doc.fontSize(8.5).font('Courier').fillColor('#1E293B');
      doc.text(line, { lineGap: 1 });
    } else if (line.trim().length > 0) {
      doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
      doc.text(line.trim(), { lineGap: 2.5, align: 'justify' });
      doc.moveDown(0.3);
    } else {
      doc.moveDown(0.3);
    }
  }

  doc.end();

  writeStream.on('finish', () => {
    console.log(`[Success] Master PDF Documentation generated successfully at:\n${pdfPath}`);
  });
}

generatePdfReport();
