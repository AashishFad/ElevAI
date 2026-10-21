const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Normalize raw extracted resume text:
 * - Normalizes Windows (\r\n) and Mac (\r) newlines to standard \n
 * - Reduces multiple blank lines to a maximum of two newlines
 * - Strips trailing/leading whitespace per line
 * - Preserves readable section headings
 */
function normalizeExtractedText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  // Replace 3+ consecutive newlines with 2 newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Parse PDF buffer into readable text
 */
async function parsePdfBuffer(buffer) {
  try {
    const data = await pdfParse(buffer);
    const rawText = data.text || '';
    return normalizeExtractedText(rawText);
  } catch (error) {
    throw new Error(`Failed to parse PDF resume: ${error.message}`);
  }
}

/**
 * Parse DOCX buffer into readable text
 */
async function parseDocxBuffer(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value || '';
    return normalizeExtractedText(rawText);
  } catch (error) {
    throw new Error(`Failed to parse DOCX resume: ${error.message}`);
  }
}

/**
 * Main parser entry point handling PDF and DOCX
 */
async function parseResumeBuffer(buffer, mimeType, fileName) {
  const extension = fileName ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase() : '';

  if (mimeType === 'application/pdf' || extension === '.pdf') {
    return await parsePdfBuffer(buffer);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    extension === '.docx' ||
    extension === '.doc'
  ) {
    return await parseDocxBuffer(buffer);
  }

  throw new Error('Unsupported file format for text extraction. Only PDF and DOCX are supported.');
}

module.exports = {
  parseResumeBuffer,
  normalizeExtractedText,
};
