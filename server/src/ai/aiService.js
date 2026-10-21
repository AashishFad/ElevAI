/**
 * ElevAI - Centralized AI Engine (Ollama + Qwen 2.5 7B)
 *
 * Core recruitment AI service powering:
 * 1. Resume Analyzer
 * 2. Resume vs Job Match Analysis (with deterministic suitability scoring)
 * 3. Text-based AI Mock Interview (Question generation & Answer evaluation)
 */
const http = require('http');
const https = require('https');
const env = require('../config/env');

const OLLAMA_BASE_URL = env.ollamaBaseUrl || 'http://localhost:11434';
const OLLAMA_MODEL = env.ollamaModel || 'qwen2.5:7b';
const AI_TIMEOUT_MS = env.aiTimeoutMs || 300000;

/**
 * Execute HTTP POST request to local Ollama API
 */
async function callOllama({ prompt, systemPrompt, jsonMode = true, temperature = 0.2, maxTokens = 900, timeoutMs = AI_TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL('/api/generate', OLLAMA_BASE_URL);
      const isHttps = urlObj.protocol === 'https:';
      const transport = isHttps ? https : http;

      const payload = JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        system: systemPrompt || 'You are ElevAI, an expert AI Technical Recruiter, Hiring Specialist, and Resume Evaluator.',
        stream: false,
        format: jsonMode ? 'json' : undefined,
        options: {
          temperature,
          num_ctx: 4096,
          num_predict: maxTokens,
        },
      });

      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      };

      const req = transport.request(reqOptions, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(responseBody);
              resolve(parsed.response);
            } catch (parseErr) {
              reject(new Error('Failed to parse Ollama JSON wrapper response.'));
            }
          } else {
            let errorMsg = `Ollama returned HTTP status ${res.statusCode}`;
            try {
              const errObj = JSON.parse(responseBody);
              if (errObj.error) errorMsg = errObj.error;
            } catch (_) {}

            if (res.statusCode === 404 && errorMsg.includes('not found')) {
              reject({
                statusCode: 500,
                message: `Required local AI model "${OLLAMA_MODEL}" is not available in Ollama. Run: "ollama pull ${OLLAMA_MODEL}".`,
              });
            } else {
              reject({
                statusCode: 502,
                message: `Ollama error: ${errorMsg}`,
              });
            }
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          statusCode: 504,
          message: 'AI request took too long to generate a response. Please ensure your machine has sufficient resources.',
        });
      });

      req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND') {
          reject({
            statusCode: 503,
            message: 'Local AI service is unavailable. Please make sure Ollama is running (`ollama serve`).',
          });
        } else {
          reject({
            statusCode: 500,
            message: `AI service error: ${err.message}`,
          });
        }
      });

      req.write(payload);
      req.end();
    } catch (setupErr) {
      reject({
        statusCode: 500,
        message: `Failed to initialize AI connection: ${setupErr.message}`,
      });
    }
  });
}

/**
 * Robust JSON parser that handles markdown fences and extracts outermost JSON objects/arrays
 */
function parseAiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI output is empty or not a string.');
  }

  let text = rawText.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. Try direct parse first
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // 2. Find outermost '{ ... }'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (braceErr) {}
    }

    // 3. Find outermost '[ ... ]'
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      } catch (bracketErr) {}
    }

    // 4. Try auto-closing braces if truncated
    if (firstBrace !== -1) {
      try {
        let candidate = text.substring(firstBrace);
        const openBraces = (candidate.match(/{/g) || []).length;
        const closeBraces = (candidate.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
          candidate += '}'.repeat(openBraces - closeBraces);
          return JSON.parse(candidate);
        }
      } catch (_) {}
    }

    throw new Error('AI model output could not be parsed into valid structured JSON.');
  }
}

/**
 * Deterministic calculation of Job Match Score
 * Explains suitability mathematically from matching, partial, and missing skills.
 */
function calculateDeterministicJobMatchScore(matchingSkills, partialMatches, missingSkills) {
  const matchCount = Array.isArray(matchingSkills) ? matchingSkills.length : 0;
  const partialCount = Array.isArray(partialMatches) ? partialMatches.length : 0;
  const missingCount = Array.isArray(missingSkills) ? missingSkills.length : 0;
  const total = matchCount + partialCount + missingCount;

  if (total === 0) return 78;

  const points = matchCount * 1.0 + partialCount * 0.5;
  const rawScore = (points / total) * 100;
  return Math.round(Math.max(15, Math.min(98, rawScore)));
}

/**
 * Helper to truncate large text blocks to preserve local GPU/CPU VRAM and latency
 */
function truncateText(text, maxChars = 3000) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n... [Resume content trimmed for performance]';
}

/**
 * Validate and sanitize structured AI analysis response object
 */
function validateAnalysisResponse(parsedData) {
  if (!parsedData || typeof parsedData !== 'object') {
    throw new Error('AI analysis output is not a valid JSON object.');
  }

  const clampScore = (num, fallback = 78) => {
    const val = parseInt(num, 10);
    return isNaN(val) ? fallback : Math.max(0, Math.min(100, val));
  };

  const overallScore = clampScore(parsedData.overallScore, 78);
  const summary = parsedData.summary || 'Resume evaluated against target career benchmark.';

  const scoreBreakdown = {
    careerRelevance: clampScore(parsedData.scoreBreakdown?.careerRelevance, overallScore),
    technicalSkills: clampScore(parsedData.scoreBreakdown?.technicalSkills, overallScore),
    projects: clampScore(parsedData.scoreBreakdown?.projects, overallScore),
    experience: clampScore(parsedData.scoreBreakdown?.experience, overallScore),
    structure: clampScore(parsedData.scoreBreakdown?.structure, overallScore),
    clarity: clampScore(parsedData.scoreBreakdown?.clarity, overallScore),
  };

  const strengths = Array.isArray(parsedData.strengths) && parsedData.strengths.length > 0
    ? parsedData.strengths.slice(0, 8)
    : ['Demonstrates solid foundational technical knowledge aligned with target role.'];

  const weaknesses = Array.isArray(parsedData.weaknesses) && parsedData.weaknesses.length > 0
    ? parsedData.weaknesses.slice(0, 8)
    : ['Include more quantifiable metrics and measurable production outcomes in project descriptions.'];

  const sectionFeedback = parsedData.sectionFeedback || {
    summary: { score: 78, feedback: 'Summary is present.', suggestions: 'Sharpen alignment with target role.' },
    skills: { score: 82, feedback: 'Key technical competencies identified.', suggestions: 'Categorize by languages, frameworks, and databases.' },
    projects: { score: 75, feedback: 'Good practical projects shown.', suggestions: 'Add quantifiable metrics and architectural choices.' },
    experience: { score: 70, feedback: 'Relevant experience included.', suggestions: 'Highlight impact and responsibilities clearly.' },
    education: { score: 85, feedback: 'Education formatting is clean.', suggestions: 'Keep current layout.' },
    achievements: { score: 70, feedback: 'Achievements noted.', suggestions: 'Add hackathons, open source, or awards.' },
    certifications: { score: 70, feedback: 'Certifications noted.', suggestions: 'Obtain industry-recognized role certifications.' },
  };

  const skillsFound = {
    programmingLanguages: Array.isArray(parsedData.skillsFound?.programmingLanguages) ? parsedData.skillsFound.programmingLanguages : [],
    frameworks: Array.isArray(parsedData.skillsFound?.frameworks) ? parsedData.skillsFound.frameworks : [],
    databases: Array.isArray(parsedData.skillsFound?.databases) ? parsedData.skillsFound.databases : [],
    tools: Array.isArray(parsedData.skillsFound?.tools) ? parsedData.skillsFound.tools : [],
    cloudDevOps: Array.isArray(parsedData.skillsFound?.cloudDevOps) ? parsedData.skillsFound.cloudDevOps : [],
    softSkills: Array.isArray(parsedData.skillsFound?.softSkills) ? parsedData.skillsFound.softSkills : [],
  };

  const recommendedSkills = Array.isArray(parsedData.recommendedSkills) ? parsedData.recommendedSkills : [];

  const actionItems = Array.isArray(parsedData.actionItems) && parsedData.actionItems.length > 0
    ? parsedData.actionItems.map((item) => ({
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(item.priority) ? item.priority : 'MEDIUM',
        title: item.title || 'Enhance Technical Clarity',
        description: item.description || 'Highlight production impact and key technologies.',
      }))
    : [
        {
          priority: 'HIGH',
          title: 'Quantify Technical Accomplishments',
          description: 'Add specific metrics, benchmarks, and technologies to your project descriptions.',
        },
      ];

  return {
    overallScore,
    summary,
    scoreBreakdown,
    strengths,
    weaknesses,
    sectionFeedback,
    skillsFound,
    recommendedSkills,
    actionItems,
  };
}

/**
 * Validate and sanitize structured AI job optimization response object
 */
function validateJobOptimizationResponse(parsedData, requiredSkills = []) {
  if (!parsedData || typeof parsedData !== 'object') {
    throw new Error('AI job optimization output is not a valid JSON object.');
  }

  let matchingSkills = Array.isArray(parsedData.matchingSkills) ? parsedData.matchingSkills : [];
  let missingSkills = Array.isArray(parsedData.missingSkills) ? parsedData.missingSkills : [];
  let partialMatches = Array.isArray(parsedData.partialMatches) ? parsedData.partialMatches : [];
  const keywordSuggestions = Array.isArray(parsedData.keywordSuggestions) ? parsedData.keywordSuggestions : [];

  // If explicit job requiredSkills are provided, reconcile strictly with that list
  if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
    const normReq = requiredSkills.map((s) => s.trim()).filter(Boolean);

    // Clean matchingSkills: normalize to exact case from requiredSkills where matched
    const reconciledMatching = [];
    const reconciledPartial = [];
    const reconciledMissing = [];

    normReq.forEach((reqSkill) => {
      const lowerReq = reqSkill.toLowerCase();

      // Check if AI matched it
      const isMatched = matchingSkills.some(
        (m) => typeof m === 'string' && (m.toLowerCase() === lowerReq || m.toLowerCase().includes(lowerReq) || lowerReq.includes(m.toLowerCase()))
      );

      // Check if AI partially matched it
      const isPartial = partialMatches.some(
        (p) => typeof p === 'string' && (p.toLowerCase() === lowerReq || p.toLowerCase().includes(lowerReq) || lowerReq.includes(p.toLowerCase()))
      );

      if (isMatched) {
        reconciledMatching.push(reqSkill);
      } else if (isPartial) {
        reconciledPartial.push(reqSkill);
      } else {
        reconciledMissing.push(reqSkill);
      }
    });

    matchingSkills = reconciledMatching;
    partialMatches = reconciledPartial;
    missingSkills = reconciledMissing;
  }

  const summary = parsedData.summary || 'Resume analyzed against job requisition requirements.';

  const sectionRecommendations = parsedData.sectionRecommendations || {
    summary: 'Highlight core experience relevant to this specific requisition.',
    skills: 'Move key matched technologies to the top of your skills list.',
    projects: 'Emphasize architectural decisions that align with the required tech stack.',
    experience: 'Highlight responsibilities matching the job posting.',
    education: 'Ensure degree and graduation date are clearly visible.',
  };

  const projectRecommendations = Array.isArray(parsedData.projectRecommendations)
    ? parsedData.projectRecommendations
    : ['Demonstrate hands-on projects featuring the core technologies required in the job description.'];

  const priorityActions = Array.isArray(parsedData.priorityActions) && parsedData.priorityActions.length > 0
    ? parsedData.priorityActions.map((action) => ({
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(action.priority) ? action.priority : 'MEDIUM',
        title: action.title || 'Align Core Competencies',
        explanation: action.explanation || 'Ensure your resume demonstrates the required technologies.',
      }))
    : [
        {
          priority: 'HIGH',
          title: 'Highlight Required Skills',
          explanation: 'Demonstrate direct experience with required tools in your project bullets.',
        },
      ];

  // Calculate deterministic score based on skills extracted by AI
  const matchScore = calculateDeterministicJobMatchScore(matchingSkills, partialMatches, missingSkills);

  return {
    matchScore,
    summary,
    matchingSkills,
    missingSkills,
    partialMatches,
    keywordSuggestions,
    sectionRecommendations,
    projectRecommendations,
    priorityActions,
  };
}

/**
 * Validate and sanitize structured AI interview questions array
 */
function validateInterviewQuestions(parsedData, targetCount = 3) {
  let questionsArray = [];

  if (Array.isArray(parsedData)) {
    questionsArray = parsedData;
  } else if (parsedData && typeof parsedData === 'object') {
    if (Array.isArray(parsedData.questions)) {
      questionsArray = parsedData.questions;
    } else if (Array.isArray(parsedData.interviewQuestions)) {
      questionsArray = parsedData.interviewQuestions;
    }
  }

  if (questionsArray.length === 0) {
    throw new Error('AI output did not contain an array of interview questions.');
  }

  return questionsArray.slice(0, targetCount).map((q, idx) => ({
    questionNumber: idx + 1,
    questionText: q.questionText || q.question || `Explain your experience and approach as a technical engineer.`,
    category: q.category || 'TECHNICAL',
    difficulty: q.difficulty || 'INTERMEDIATE',
    expectedTopics: Array.isArray(q.expectedTopics) && q.expectedTopics.length > 0
      ? q.expectedTopics
      : ['Core Concepts', 'Practical Application', 'Trade-offs'],
  }));
}

/**
 * Validate and sanitize structured AI interview evaluation object
 */
function validateInterviewEvaluation(parsedData) {
  if (!parsedData || typeof parsedData !== 'object') {
    throw new Error('AI answer evaluation output is not a valid JSON object.');
  }

  const clampScore = (num, fallback = 7.5) => {
    const val = parseFloat(num);
    return isNaN(val) ? fallback : Math.max(0, Math.min(10, val));
  };

  const score = clampScore(parsedData.score, 7.5);
  const technicalScore = clampScore(parsedData.technicalScore, score);
  const communicationScore = clampScore(parsedData.communicationScore, score);
  const relevanceScore = clampScore(parsedData.relevanceScore, score);

  const feedback = parsedData.feedback || 'Answer demonstrates fundamental technical understanding with structured delivery.';
  const strengths = Array.isArray(parsedData.strengths) ? parsedData.strengths : ['Clear presentation of core concepts.'];
  const weaknesses = Array.isArray(parsedData.weaknesses) ? parsedData.weaknesses : ['Could discuss concrete edge cases and system performance.'];
  const idealAnswer = parsedData.idealAnswer || 'A comprehensive response articulates core concepts, architectural trade-offs, and practical code design.';

  return {
    score,
    technicalScore,
    communicationScore,
    relevanceScore,
    feedback,
    strengths,
    weaknesses,
    idealAnswer,
  };
}

// ==========================================
// DETERMINISTIC ATS & INTERVIEW FALLBACK ENGINES
// (Activated when Ollama is offline or in cloud environments like Render)
// ==========================================

const TECH_SKILLS_DICTIONARY = {
  programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS', 'Bash'],
  frameworks: ['React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'ASP.NET', 'Tailwind CSS', 'Redux'],
  databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Supabase', 'Oracle', 'DynamoDB', 'Cassandra', 'Prisma', 'TypeORM', 'Mongoose'],
  tools: ['Git', 'GitHub', 'Docker', 'Kubernetes', 'Webpack', 'Vite', 'Postman', 'Figma', 'Linux', 'Jira', 'VS Code'],
  cloudDevOps: ['AWS', 'Azure', 'Google Cloud', 'GCP', 'CI/CD', 'GitHub Actions', 'Terraform', 'Vercel', 'Render', 'Nginx'],
  softSkills: ['Problem Solving', 'Team Collaboration', 'Communication', 'Agile / Scrum', 'Critical Thinking', 'Leadership', 'Time Management', 'Code Review'],
};

function extractSkillsFromText(text) {
  const norm = text || '';
  const found = {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    tools: [],
    cloudDevOps: [],
    softSkills: [],
  };

  for (const [category, skills] of Object.entries(TECH_SKILLS_DICTIONARY)) {
    skills.forEach((skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
      if (regex.test(norm)) {
        found[category].push(skill);
      }
    });
  }
  return found;
}

function generateDeterministicResumeAnalysis({ targetRole, experienceLevel, resumeText }) {
  const extracted = extractSkillsFromText(resumeText);
  const totalFound = Object.values(extracted).reduce((acc, arr) => acc + arr.length, 0);

  const hasExp = /experience|employment|work history/i.test(resumeText);
  const hasEdu = /education|university|college|bachelor|master|degree/i.test(resumeText);
  const hasProj = /projects|portfolio|github/i.test(resumeText);

  let score = 66;
  if (totalFound >= 4) score += 10;
  if (totalFound >= 8) score += 6;
  if (hasExp) score += 6;
  if (hasEdu) score += 5;
  if (hasProj) score += 5;
  const overallScore = Math.min(94, Math.max(68, score));

  const allFoundFlat = [
    ...extracted.programmingLanguages,
    ...extracted.frameworks,
    ...extracted.databases,
    ...extracted.tools,
  ];

  const candidateRecommended = ['TypeScript', 'Docker', 'CI/CD', 'Redis', 'Unit Testing', 'System Architecture']
    .filter((s) => !allFoundFlat.includes(s))
    .slice(0, 4);

  return validateAnalysisResponse({
    overallScore,
    summary: `Candidate demonstrates solid technical qualifications for ${targetRole || 'the target role'}. Identified ${totalFound} verified technical and organizational proficiencies with strong structural readiness.`,
    scoreBreakdown: {
      careerRelevance: Math.min(95, overallScore + 2),
      technicalSkills: Math.min(95, overallScore + (totalFound >= 6 ? 4 : -2)),
      projects: hasProj ? Math.min(95, overallScore + 2) : overallScore - 6,
      experience: hasExp ? Math.min(95, overallScore) : overallScore - 8,
      structure: Math.min(95, overallScore + 4),
      clarity: Math.min(95, overallScore + 3),
    },
    strengths: [
      `Demonstrated competency in ${allFoundFlat.slice(0, 3).join(', ') || 'core foundational technologies'}.`,
      hasProj ? 'Practical project work featured with architectural context.' : 'Clear professional objectives present.',
      hasEdu ? 'Formal educational background appropriately documented.' : 'Strong foundational technical interest.',
    ],
    weaknesses: [
      'Quantify project outcomes with concrete metrics (e.g., latency reduction, user scale).',
      candidateRecommended.length > 0 ? `Consider expanding experience with modern tooling: ${candidateRecommended.join(', ')}.` : 'Add deeper architectural trade-offs in project bullet points.',
    ],
    sectionFeedback: {
      summary: { score: 82, feedback: 'Career intent is clearly outlined.', suggestions: `Tailor summary specifically towards ${targetRole || 'target positions'}.` },
      skills: { score: totalFound >= 6 ? 88 : 76, feedback: `${totalFound} relevant skills detected across languages and tooling.`, suggestions: 'Group skills by categorization (Languages, Frameworks, Cloud, Databases).' },
      projects: { score: hasProj ? 84 : 70, feedback: hasProj ? 'Projects section is clearly distinguishable.' : 'Add 2-3 technical showcase projects.', suggestions: 'Use the Google X-Y-Z formula for bullets: Accomplished [X], measured by [Y], by doing [Z].' },
      experience: { score: hasExp ? 80 : 72, feedback: hasExp ? 'Professional trajectory is documented.' : 'Emphasize internships or open source contributions.', suggestions: 'Lead each bullet with strong active verbs.' },
      education: { score: hasEdu ? 90 : 78, feedback: 'Academic credentials clearly visible.', suggestions: 'Include relevant coursework and academic honors.' },
      achievements: { score: 75, feedback: 'Standard portfolio formatting observed.', suggestions: 'Highlight hackathons, open source pull requests, or technical certifications.' },
      certifications: { score: 72, feedback: 'Standard credential baseline.', suggestions: 'Pursue vendor certifications aligned with the target stack.' },
    },
    skillsFound: extracted,
    recommendedSkills: candidateRecommended,
    actionItems: [
      { priority: 'HIGH', title: 'Quantify Bullet Points', description: 'Incorporate quantifiable metrics, performance improvements, and numbers into each project description.' },
      { priority: 'MEDIUM', title: 'Highlight Target Tooling', description: `Emphasize hands-on experience with ${candidateRecommended[0] || 'modern cloud technologies'}.` },
    ],
  });
}

function generateDeterministicJobOptimization({
  targetRole,
  experienceLevel,
  resumeText,
  jobDescription,
  companyName,
  jobTitle,
  jobLocation,
  requiredSkills = [],
}) {
  const normResume = (resumeText || '').toLowerCase();
  const matchingSkills = [];
  const missingSkills = [];

  const skillsToCheck = Array.isArray(requiredSkills) && requiredSkills.length > 0
    ? requiredSkills
    : ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST API', 'Problem Solving'];

  skillsToCheck.forEach((skill) => {
    const trimmed = String(skill).trim();
    if (!trimmed) return;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
    if (regex.test(normResume)) {
      matchingSkills.push(trimmed);
    } else {
      missingSkills.push(trimmed);
    }
  });

  const calculatedScore = calculateDeterministicJobMatchScore(matchingSkills, [], missingSkills);

  return validateJobOptimizationResponse({
    matchScore: calculatedScore,
    matchingSkills,
    partialMatches: [],
    missingSkills,
    summary: `Resume matches ${matchingSkills.length} of ${skillsToCheck.length} identified competencies for ${jobTitle || targetRole || 'the requisition'} at ${companyName || 'Target Organization'}. Calculated ATS Match Score: ${calculatedScore}%.`,
    keywordSuggestions: missingSkills.slice(0, 5),
    sectionRecommendations: {
      summary: `Reference direct experience matching the ${jobTitle || 'target'} role.`,
      skills: matchingSkills.length > 0 ? `Feature ${matchingSkills.slice(0, 3).join(', ')} prominently at the top of your skills section.` : 'Align skills with the job requirements.',
      projects: 'Prioritize projects that demonstrate production usage of required technologies.',
      experience: 'Align bullet points with the primary responsibilities mentioned in the job description.',
      education: 'Ensure degree title and graduation dates are cleanly formatted.',
    },
    projectRecommendations: [
      `Build or showcase a feature that directly utilizes ${missingSkills[0] || 'the core stack'}.`,
      'Emphasize end-to-end delivery and cloud deployments.',
    ],
    priorityActions: [
      {
        priority: 'HIGH',
        title: 'Feature Matched Skills in Summary',
        explanation: `Explicitly mention ${matchingSkills.slice(0, 3).join(', ') || 'core qualifications'} in your executive summary.`,
      },
      missingSkills.length > 0
        ? {
            priority: 'MEDIUM',
            title: `Bridge Gap in ${missingSkills[0]}`,
            explanation: `Review fundamentals or showcase portfolio work demonstrating familiarity with ${missingSkills[0]}.`,
          }
        : {
            priority: 'LOW',
            title: 'Review System Design',
            explanation: 'Prepare to discuss architecture and scalability during technical rounds.',
          },
    ],
  }, requiredSkills);
}

function generateDeterministicInterviewQuestions({ type, difficulty, targetRole, experienceLevel, questionCount = 3 }) {
  const bank = [
    {
      questionNumber: 1,
      questionText: `Can you walk me through the architecture of a complex project you built as a ${targetRole || 'Software Engineer'}, highlighting the key technical decisions and trade-offs you made?`,
      category: type || 'TECHNICAL',
      difficulty: difficulty || 'INTERMEDIATE',
      expectedTopics: ['System Architecture', 'Component Design', 'Trade-offs & Decision Making', 'Performance Optimization'],
    },
    {
      questionNumber: 2,
      questionText: `How do you handle asynchronous workflows, state management, or data consistency in your applications? Describe a specific challenging bug you diagnosed and resolved.`,
      category: type || 'TECHNICAL',
      difficulty: difficulty || 'INTERMEDIATE',
      expectedTopics: ['Asynchronous Programming', 'Debugging Strategies', 'Data Consistency', 'Root Cause Analysis'],
    },
    {
      questionNumber: 3,
      questionText: `Describe a situation where project requirements changed suddenly or you encountered technical disagreements with team members. How did you resolve it?`,
      category: type === 'TECHNICAL' ? 'TECHNICAL' : 'HR',
      difficulty: difficulty || 'INTERMEDIATE',
      expectedTopics: ['Communication', 'Collaboration', 'Adaptability', 'Conflict Resolution'],
    },
  ];

  return { questions: bank.slice(0, questionCount) };
}

function generateDeterministicInterviewEvaluation({ questionText, expectedTopics = [], category, difficulty, answerText, targetRole }) {
  const words = (answerText || '').trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let baseScore = 6.5;
  if (wordCount > 30) baseScore += 1.0;
  if (wordCount > 60) baseScore += 0.8;
  if (wordCount > 100) baseScore += 0.5;

  let topicHits = 0;
  if (Array.isArray(expectedTopics)) {
    expectedTopics.forEach((topic) => {
      const parts = topic.toLowerCase().split(/\s+/);
      if (parts.some((p) => (answerText || '').toLowerCase().includes(p))) {
        topicHits++;
      }
    });
  }
  if (topicHits > 0) baseScore += 0.7;

  const score = Math.min(9.5, Math.max(5.0, baseScore));

  return validateInterviewEvaluation({
    score,
    technicalScore: Math.min(10, score + 0.3),
    communicationScore: wordCount > 40 ? Math.min(10, score + 0.5) : score - 0.5,
    relevanceScore: Math.min(10, score + (topicHits > 0 ? 0.4 : -0.3)),
    feedback: wordCount > 30
      ? `Strong articulation of core concepts relevant to ${targetRole || 'the role'}. Addressed ${topicHits > 0 ? 'key technical aspects' : 'fundamental principles'} with good structure.`
      : 'Response covers the basic idea but would benefit from greater technical depth, concrete examples, and architectural reasoning.',
    strengths: [
      'Direct and clear approach to answering the prompt.',
      wordCount > 50 ? 'Provided sufficient context and structured thought process.' : 'Identified key concepts accurately.',
    ],
    weaknesses: [
      'Could incorporate specific production metrics, benchmarks, or edge cases.',
      'Discuss alternative architectural choices or trade-offs considered.',
    ],
    idealAnswer: 'An ideal response clearly defines the problem, articulates the technical approach with architectural trade-offs, discusses error handling/scalability, and summarizes lessons learned.',
  });
}

// ==========================================
// CORE RECRUITMENT AI GENERATORS
// ==========================================

/**
 * 1. RESUME ANALYZER
 */
async function generateResumeAnalysis({ targetRole, experienceLevel, resumeText }) {
  const truncatedResume = truncateText(resumeText, 2500);

  const prompt = `You are ElevAI's Senior Technical Resume Evaluator.
Analyze the candidate's resume for the target career role: "${targetRole}" (${experienceLevel || 'Entry Level'}).

=== CANDIDATE RESUME ===
${truncatedResume}
=== END RESUME ===

Instructions:
1. Evaluate career relevance, technical skills, projects, experience, structure, and clarity.
2. Identify strengths, weaknesses, and categorized skills found in the resume.
3. Provide actionable suggestions for each section.
4. Output STRICT JSON ONLY matching this exact structure:
{
  "overallScore": 82,
  "summary": "Concise 2-sentence executive summary of candidate readiness for ${targetRole}.",
  "scoreBreakdown": {
    "careerRelevance": 85,
    "technicalSkills": 80,
    "projects": 82,
    "experience": 78,
    "structure": 88,
    "clarity": 85
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "sectionFeedback": {
    "summary": { "score": 80, "feedback": "Feedback on summary", "suggestions": "Tips" },
    "skills": { "score": 85, "feedback": "Feedback on skills", "suggestions": "Tips" },
    "projects": { "score": 80, "feedback": "Feedback on projects", "suggestions": "Tips" },
    "experience": { "score": 75, "feedback": "Feedback on experience", "suggestions": "Tips" },
    "education": { "score": 90, "feedback": "Feedback on education", "suggestions": "Tips" },
    "achievements": { "score": 70, "feedback": "Feedback on achievements", "suggestions": "Tips" },
    "certifications": { "score": 70, "feedback": "Feedback on certifications", "suggestions": "Tips" }
  },
  "skillsFound": {
    "programmingLanguages": ["JavaScript", "Python"],
    "frameworks": ["React", "Node.js"],
    "databases": ["PostgreSQL"],
    "tools": ["Git", "Docker"],
    "cloudDevOps": ["AWS"],
    "softSkills": ["Problem Solving", "Collaboration"]
  },
  "recommendedSkills": ["TypeScript", "Redis", "CI/CD"],
  "actionItems": [
    { "priority": "HIGH", "title": "Quantify Impact", "description": "Add measurable numbers to project accomplishments." },
    { "priority": "MEDIUM", "title": "Add Missing Keywords", "description": "Incorporate key industry tools." }
  ]
}`;

  try {
    const rawOutput = await callOllama({
      prompt,
      systemPrompt: 'You are an expert ATS and Technical Resume Evaluator. Return STRICT JSON ONLY without markdown formatting or commentary.',
      jsonMode: true,
    });

    const parsed = parseAiJson(rawOutput);
    return validateAnalysisResponse(parsed);
  } catch (err) {
    console.warn(`[AI Engine] Local Ollama unavailable (${err.message}). Activating deterministic ATS engine.`);
    return generateDeterministicResumeAnalysis({ targetRole, experienceLevel, resumeText });
  }
}

/**
 * 2. RESUME VS JOB MATCH ANALYSIS
 * Compares candidate resume against a specific job posting.
 */
async function generateJobOptimization({
  targetRole,
  experienceLevel,
  resumeText,
  jobDescription,
  companyName,
  jobTitle,
  jobLocation,
  requiredSkills = [],
}) {
  const truncatedResume = truncateText(resumeText, 2500);
  const truncatedJob = truncateText(jobDescription, 1500);
  const skillsListText = Array.isArray(requiredSkills) && requiredSkills.length > 0
    ? requiredSkills.join(', ')
    : 'Extracted from job description';

  const prompt = `You are ElevAI's Recruitment Job Requisition Matching Engine.
Compare the candidate's resume against the specific job posting for "${jobTitle || targetRole}" at "${companyName || 'Target Company'}".

=== EXPLICIT REQUIRED SKILLS & TECH STACK ===
${skillsListText}
=== END REQUIRED SKILLS ===

=== JOB DESCRIPTION ===
${truncatedJob}
=== END JOB DESCRIPTION ===

=== CANDIDATE RESUME ===
${truncatedResume}
=== END RESUME ===

Instructions:
1. Carefully compare the Required Skills & Tech Stack list against the candidate's resume:
   - matchingSkills: Skills from the required skills list clearly demonstrated in the candidate's resume.
   - partialMatches: Skills from the required skills list partially demonstrated or related.
   - missingSkills: Skills from the required skills list that are NOT found in the candidate's resume.
   IMPORTANT: Do NOT add external technologies to missingSkills if they are not part of the job's required skills.
2. Provide concise tailoring recommendations and observations.
3. Output STRICT JSON ONLY matching:
{
  "matchingSkills": ["Skill A", "Skill B"],
  "partialMatches": ["Skill C"],
  "missingSkills": ["Skill D", "Skill E"],
  "summary": "Detailed 2-sentence assessment of candidate suitability for ${jobTitle || targetRole}.",
  "keywordSuggestions": ["Suggested relevant skill 1", "Suggested relevant skill 2"],
  "sectionRecommendations": {
    "summary": "Emphasize capabilities matching the job description.",
    "skills": "Move matching technologies to top of skills list.",
    "projects": "Highlight projects using the target stack.",
    "experience": "Align bullet points with required responsibilities.",
    "education": "Ensure clear degree formatting."
  },
  "projectRecommendations": [
    "Highlight production deployments and system architecture."
  ],
  "priorityActions": [
    {
      "priority": "HIGH",
      "title": "Highlight Core Matching Skills",
      "explanation": "Feature matching technologies prominently in summary and project bullets."
    }
  ]
}`;

  try {
    const rawOutput = await callOllama({
      prompt,
      systemPrompt: 'You are an ATS and Technical Recruitment Engine. Return STRICT JSON ONLY with accurate skill extraction matching the required skills.',
      jsonMode: true,
    });

    const parsed = parseAiJson(rawOutput);
    return validateJobOptimizationResponse(parsed, requiredSkills);
  } catch (err) {
    console.warn(`[AI Engine] Local Ollama unavailable (${err.message}). Activating deterministic ATS match engine.`);
    return generateDeterministicJobOptimization({
      targetRole,
      experienceLevel,
      resumeText,
      jobDescription,
      companyName,
      jobTitle,
      jobLocation,
      requiredSkills,
    });
  }
}

/**
 * 3. TEXT AI MOCK INTERVIEW - QUESTION GENERATION
 */
async function generateInterviewQuestions({
  type,
  difficulty,
  targetRole,
  experienceLevel,
  questionCount = 3,
  resumeText = '',
  jobDescription = '',
}) {
  const truncatedResume = resumeText ? truncateText(resumeText, 1500) : '';
  const truncatedJob = jobDescription ? truncateText(jobDescription, 1000) : '';

  const prompt = `You are ElevAI's Senior Technical Interviewer.
Generate ${questionCount} tailored, high-quality interview questions for a candidate interviewing for:
- Role: "${targetRole}"
- Experience Level: "${experienceLevel || 'Mid-Level'}"
- Interview Type: "${type}" (TECHNICAL, HR, or MIXED)
- Difficulty: "${difficulty}" (BEGINNER, INTERMEDIATE, or ADVANCED)

${truncatedJob ? `=== JOB REQUIREMENTS ===\n${truncatedJob}\n=== END JOB ===\n` : ''}
${truncatedResume ? `=== CANDIDATE RESUME SUMMARY ===\n${truncatedResume}\n=== END RESUME ===\n` : ''}

Instructions:
1. Generate exactly ${questionCount} realistic questions tailored to the role.
2. For each question, specify expected technical topics the candidate should address.
3. Output STRICT JSON ONLY matching:
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Detailed interview question text here...",
      "category": "${type}",
      "difficulty": "${difficulty}",
      "expectedTopics": ["Topic 1", "Topic 2", "Topic 3"]
    }
  ]
}`;

  try {
    const rawOutput = await callOllama({
      prompt,
      systemPrompt: 'You are a rigorous Technical Hiring Manager. Return STRICT JSON ONLY containing the interview questions array.',
      jsonMode: true,
    });

    const parsed = parseAiJson(rawOutput);
    return validateInterviewQuestions(parsed, questionCount);
  } catch (err) {
    console.warn(`[AI Engine] Local Ollama unavailable (${err.message}). Activating deterministic question generator.`);
    return generateDeterministicInterviewQuestions({ type, difficulty, targetRole, experienceLevel, questionCount });
  }
}

/**
 * 4. TEXT AI MOCK INTERVIEW - ANSWER EVALUATION
 */
async function evaluateInterviewAnswer({
  questionText,
  expectedTopics,
  category,
  difficulty,
  answerText,
  targetRole,
}) {
  const prompt = `You are ElevAI's Technical Interview Evaluator.
Evaluate the candidate's typed response to the following interview question for the role of "${targetRole}".

=== INTERVIEW QUESTION ===
${questionText}
Category: ${category} | Difficulty: ${difficulty}
Expected Key Topics: ${Array.isArray(expectedTopics) ? expectedTopics.join(', ') : 'Relevant technical depth'}
=== END QUESTION ===

=== CANDIDATE ANSWER ===
${answerText || '(Candidate provided a brief or empty answer)'}
=== END ANSWER ===

Instructions:
1. Score the answer out of 10.0 based on technical accuracy, clarity, and relevance.
2. Highlight specific strengths and weaknesses.
3. Provide an ideal benchmark response.
4. Output STRICT JSON ONLY matching:
{
  "score": 8.0,
  "technicalScore": 8.5,
  "communicationScore": 7.5,
  "relevanceScore": 8.0,
  "feedback": "Detailed constructive evaluation of the answer.",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1"],
  "idealAnswer": "Comprehensive example response covering architecture, edge cases, and code design."
}`;

  try {
    const rawOutput = await callOllama({
      prompt,
      systemPrompt: 'You are a Senior Technical Interview Evaluator. Return STRICT JSON ONLY with constructive, rigorous feedback.',
      jsonMode: true,
    });

    const parsed = parseAiJson(rawOutput);
    return validateInterviewEvaluation(parsed);
  } catch (err) {
    console.warn(`[AI Engine] Local Ollama unavailable (${err.message}). Activating deterministic answer evaluator.`);
    return generateDeterministicInterviewEvaluation({ questionText, expectedTopics, category, difficulty, answerText, targetRole });
  }
}

/**
 * Check Ollama Health
 */
async function checkOllamaHealth() {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL('/api/tags', OLLAMA_BASE_URL);
      const isHttps = urlObj.protocol === 'https:';
      const transport = isHttps ? https : http;

      const req = transport.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname,
          method: 'GET',
          timeout: 4000,
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(data);
                const hasModel = (parsed.models || []).some(
                  (m) => m.name === OLLAMA_MODEL || m.name.startsWith(OLLAMA_MODEL) || m.name === `${OLLAMA_MODEL}:latest`
                );
                const modelList = (parsed.models || []).map((m) => m.name);
                resolve({
                  available: true,
                  model: OLLAMA_MODEL,
                  hasModel: hasModel,
                  modelFound: hasModel,
                  allModels: modelList,
                  availableModels: modelList,
                });
              } catch (_) {
                resolve({ available: true, model: OLLAMA_MODEL, hasModel: true, modelFound: true, allModels: [], availableModels: [] });
              }
            } else {
              resolve({ available: false, error: `HTTP ${res.statusCode}` });
            }
          });
        }
      );

      req.on('error', (err) => resolve({ available: false, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ available: false, error: 'Connection timed out' });
      });
      req.end();
    } catch (err) {
      resolve({ available: false, error: err.message });
    }
  });
}

module.exports = {
  callOllama,
  parseAiJson,
  calculateDeterministicJobMatchScore,
  generateResumeAnalysis,
  generateJobOptimization,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  checkOllamaHealth,
};
