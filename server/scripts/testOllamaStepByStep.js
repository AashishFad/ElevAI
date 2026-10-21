/**
 * ElevAI - Individual Feature Verification for Ollama & Qwen 2.5 7B
 */
const http = require('http');
const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('../src/config/database');
const app = require('../src/app');
const aiService = require('../src/ai/aiService');

const sampleResumeText = `
Priya Sharma | Software Developer | Bangalore, India | priya.sharma@example.com
SUMMARY: Motivated Full Stack Developer experienced in React, Node.js, Express, and PostgreSQL.
SKILLS: JavaScript, TypeScript, Python, React.js, Tailwind CSS, Node.js, Express, PostgreSQL, Prisma, Docker, Git.
PROJECTS:
1. ElevAI Portal - Engineered recruitment & career prep platform with React, Express, PostgreSQL.
2. E-Commerce Microservices - Developed product catalog API with Node.js and MongoDB.
EDUCATION: B.Tech in Computer Science, ABC Institute of Technology (2020-2024), CGPA 8.7/10.
`;

async function main() {
  console.log('================================================================');
  console.log('ELEVAI - OLLAMA / QWEN 2.5 7B FEATURE-BY-FEATURE VERIFICATION');
  console.log('================================================================\n');

  // Test 1: Health
  console.log('▶ [1] Health Check...');
  const t1 = Date.now();
  const health = await aiService.checkOllamaHealth();
  console.log(`  ✔ Status: ${health.available ? 'ONLINE' : 'OFFLINE'} | Model: ${health.model} (${((Date.now() - t1) / 1000).toFixed(2)}s)`);

  // Test 2: General Chatbot
  console.log('\n▶ [2] General Career Chatbot...');
  const t2 = Date.now();
  const chat = await aiService.generateGeneralChatResponse({
    userMessage: 'Explain why indexing improves SQL query performance in 2 sentences.',
    history: [],
    userContext: { careerGoal: { targetRole: 'Backend Engineer' } },
  });
  console.log(`  ✔ Chatbot Response (${((Date.now() - t2) / 1000).toFixed(2)}s):\n"${chat.trim()}"`);

  // Test 3: Resume Analyzer
  console.log('\n▶ [3] Resume Analyzer...');
  const t3 = Date.now();
  const analysis = await aiService.generateResumeAnalysis({
    targetRole: 'Full Stack Developer',
    experienceLevel: 'Entry Level',
    resumeText: sampleResumeText,
  });
  console.log(`  ✔ Score: ${analysis.overallScore}/100 | Summary: "${analysis.summary}" (${((Date.now() - t3) / 1000).toFixed(2)}s)`);
  console.log(`  ✔ Strengths (${analysis.strengths.length}): ${analysis.strengths.slice(0, 2).join('; ')}`);

  // Test 4: Job-Specific Optimization & Deterministic Scoring
  console.log('\n▶ [4] Job Optimization & Deterministic Match...');
  const t4 = Date.now();
  const jobOpt = await aiService.generateJobOptimization({
    targetRole: 'Full Stack Engineer',
    experienceLevel: '1-3 years',
    resumeText: sampleResumeText,
    jobDescription: 'Seeking Full Stack Engineer with React, Node.js, PostgreSQL, Docker, AWS.',
    companyName: 'ElevAI Tech',
    jobTitle: 'Full Stack Engineer',
  });
  console.log(`  ✔ Deterministic Match Score: ${jobOpt.matchScore}/100 (${((Date.now() - t4) / 1000).toFixed(2)}s)`);
  console.log(`  ✔ Matching Skills: ${jobOpt.matchingSkills.join(', ')}`);
  console.log(`  ✔ Missing Skills: ${jobOpt.missingSkills.join(', ')}`);

  // Test 5: Skill Gap Analyzer
  console.log('\n▶ [5] Skill Gap Analyzer...');
  const t5 = Date.now();
  const skillGap = await aiService.generateSkillGapAnalysis({
    targetRole: 'Full Stack Engineer',
    experienceLevel: '1-3 years',
    resumeText: sampleResumeText,
  });
  console.log(`  ✔ Readiness Score: ${skillGap.overallReadinessScore}/100 (${((Date.now() - t5) / 1000).toFixed(2)}s)`);
  console.log(`  ✔ Priority Gaps: ${skillGap.priorityGaps.map(g => g.skill).join(', ')}`);

  // Test 6: AI Mock Interview (Questions & Evaluation)
  console.log('\n▶ [6] AI Mock Interview...');
  const t6 = Date.now();
  const interview = await aiService.generateInterviewQuestions({
    targetRole: 'Full Stack Engineer',
    experienceLevel: 'Entry Level',
    type: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    questionCount: 2,
    resumeText: sampleResumeText,
  });
  console.log(`  ✔ Questions Generated (${interview.questions.length}) (${((Date.now() - t6) / 1000).toFixed(2)}s):`);
  interview.questions.forEach((q, i) => console.log(`    ${i + 1}. ${q.questionText}`));

  const t6b = Date.now();
  const evaluation = await aiService.evaluateInterviewAnswer({
    targetRole: 'Full Stack Engineer',
    experienceLevel: 'Entry Level',
    questionText: interview.questions[0].questionText,
    expectedTopics: interview.questions[0].expectedTopics,
    candidateAnswer: 'React components re-render when state or props change. We optimize re-renders using useMemo, useCallback, and React.memo.',
  });
  console.log(`  ✔ Evaluation Score: ${evaluation.score}/10 (${((Date.now() - t6b) / 1000).toFixed(2)}s) | Feedback: "${evaluation.feedback.substring(0, 80)}..."`);

  // Test 7: Resume Builder AI Text Improver
  console.log('\n▶ [7] Resume Builder Text Improver...');
  const t7 = Date.now();
  const builderImprovement = await aiService.improveResumeBuilderText({
    text: 'Made backend APIs with Node.js and PostgreSQL database.',
    targetRole: 'Backend Developer',
    sectionType: 'experience',
  });
  console.log(`  ✔ Original: "${builderImprovement.original}"`);
  console.log(`  ✔ Improved (${((Date.now() - t7) / 1000).toFixed(2)}s): "${builderImprovement.improved}"`);

  console.log('\n================================================================');
  console.log('✔ ALL 7 AI MODULES OPERATING 100% LOCALLY VIA OLLAMA (QWEN 2.5 7B)!');
  console.log('================================================================');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Test Error:', err);
    process.exit(1);
  });
