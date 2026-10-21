/**
 * ElevAI — Modern Technical PDF Documentation Generator
 * Compiles ElevAI_Final_Technical_Documentation.md into a high-quality, professional technical PDF.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generateModernTechnicalPdf() {
  const mdPath = path.join(__dirname, '../../ElevAI_Final_Technical_Documentation.md');
  const pdfPath = path.join(__dirname, '../../ElevAI_Final_Technical_Documentation.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('Source markdown file not found:', mdPath);
    return;
  }

  const content = fs.readFileSync(mdPath, 'utf-8');
  const lines = content.split('\n');

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 45, bottom: 45, left: 45, right: 45 },
    info: {
      Title: 'ElevAI — Technical Project Documentation',
      Author: 'ElevAI Software Engineering Team',
      Subject: 'Technical Project Documentation & Software Architecture',
      Keywords: 'ElevAI, AI, React, Node.js, Express, Supabase, Gemini AI',
    },
  });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  let isCodeBlock = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks / ASCII diagram boxes
    if (line.startsWith('```')) {
      if (isCodeBlock) {
        isCodeBlock = false;
        doc.fontSize(7.5).font('Courier').fillColor('#0F172A');
        const codeText = codeBuffer.join('\n');
        
        // Draw card background
        const boxHeight = Math.min(300, codeBuffer.length * 10 + 12);
        if (doc.y + boxHeight > 750) {
          doc.addPage();
        }
        
        const startY = doc.y;
        doc.rect(45, startY, 505, boxHeight).fillAndStroke('#F8FAFC', '#E2E8F0');
        doc.fillColor('#0F172A');
        doc.text(codeText, 55, startY + 8, { width: 485, lineGap: 1 });
        doc.y = startY + boxHeight + 10;
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

    // Page overflow safety
    if (doc.y > 740) {
      doc.addPage();
    }

    // Handle Headings
    if (line.startsWith('# ')) {
      doc.addPage();
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#0F172A');
      doc.text(line.replace('# ', '').trim());
      doc.moveDown(0.4);
    } else if (line.startsWith('## ')) {
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0891B2');
      doc.text(line.replace('## ', '').trim());
      doc.moveDown(0.6);
      doc.strokeColor('#0891B2').lineWidth(1.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.6);
    } else if (line.startsWith('### ')) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1E293B');
      doc.text(line.replace('### ', '').trim());
      doc.moveDown(0.3);
    } else if (line.startsWith('---')) {
      doc.moveDown(0.4);
      doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.4);
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      doc.fontSize(9.5).font('Helvetica').fillColor('#334155');
      doc.text(`•  ${line.substring(2).trim()}`, { indent: 8, lineGap: 2 });
      doc.moveDown(0.15);
    } else if (line.startsWith('|')) {
      // Table formatting
      doc.fontSize(8.5).font('Courier').fillColor('#1E293B');
      doc.text(line, { lineGap: 1 });
    } else if (line.trim().length > 0) {
      doc.fontSize(9.5).font('Helvetica').fillColor('#334155');
      doc.text(line.trim(), { lineGap: 2.2, align: 'justify' });
      doc.moveDown(0.3);
    } else {
      doc.moveDown(0.2);
    }
  }

  doc.end();

  writeStream.on('finish', () => {
    console.log(`[Success] Modern Technical PDF generated successfully at:\n${pdfPath}`);
  });
}

generateModernTechnicalPdf();
