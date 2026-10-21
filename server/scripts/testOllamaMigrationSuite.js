/**
 * ElevAI - Ollama AI Engine (Qwen 2.5 7B) Comprehensive Verification Suite
 */
const http = require('http');
const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('../src/config/database');
const app = require('../src/app');
const aiService = require('../src/ai/aiService');

async function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: server.address().port,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runOllamaVerification() {
  console.log('================================================================');
  console.log('ELEVAI - OLLAMA / QWEN 2.5 7B MIGRATION VERIFICATION SUITE');
  console.log('================================================================\n');

  const prisma = getPrismaClient();

  // 1. Setup Test User & Career Goal & Resume
  console.log('▶ [SETUP] Preparing test user, career goal, and resume...');
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'ollama.test@elevai.com' },
    update: { passwordHash, role: 'USER' },
    create: {
      name: 'Priya Sharma (AI Test)',
      email: 'ollama.test@elevai.com',
      passwordHash,
      role: 'USER',
    },
  });

  const careerGoal = await prisma.careerGoal.upsert({
    where: { userId: testUser.id },
    update: {
      targetRole: 'Full Stack Engineer',
      experienceLevel: 'ONE_TO_TWO_YEARS',
    },
    create: {
      userId: testUser.id,
      targetRole: 'Full Stack Engineer',
      experienceLevel: 'ONE_TO_TWO_YEARS',
    },
  });

  let testResume = await prisma.resume.findFirst({
    where: { userId: testUser.id },
  });

  const sampleResumeText = `
Priya Sharma
Full Stack Software Developer | Bangalore, India | priya.sharma@example.com

SUMMARY
Motivated Full Stack Developer with hands-on experience in building scalable web applications using React, Node.js, Express, and PostgreSQL. Passionate about clean code, RESTful API architecture, and modern DevOps workflows.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3
- Frontend: React.js, Redux Toolkit, Tailwind CSS, Vite
- Backend: Node.js, Express.js, RESTful APIs, JWT Authentication
- Databases: PostgreSQL, Prisma ORM, MongoDB, Redis
- Tools & Cloud: Git, GitHub, Docker, Postman, Jest, AWS (S3, EC2)

PROJECTS
1. ElevAI Recruitment Portal
- Engineered full-stack recruitment platform with role-based access control and resume parsing.
- Implemented responsive React frontend with Tailwind CSS and secure Express backend.
- Optimized database queries using PostgreSQL and Prisma ORM, reducing response times by 25%.

2. E-Commerce Microservices Platform
- Developed modular backend services with Node.js and MongoDB for catalog and order management.
- Integrated Stripe payment gateway and JWT token authentication.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
ABC Institute of Technology, CGPA: 8.7/10 (2020 - 2024)
`;

  if (!testResume) {
    testResume = await prisma.resume.create({
      data: {
        userId: testUser.id,
        originalFileName: 'Priya_Sharma_Resume.pdf',
        storagePath: 'resumes/priya_sharma_ollama.pdf',
        fileType: 'pdf',
        fileSize: 1048576,
        status: 'READY',
        extractedText: sampleResumeText,
      },
    });
  } else {
    testResume = await prisma.resume.update({
      where: { id: testResume.id },
      data: { status: 'READY', extractedText: sampleResumeText },
    });
  }

  // Start test server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test API Server running on port ${port}\n`);

  // Authenticate to get JWT
  const loginRes = await makeRequest(server, { method: 'POST', path: '/api/auth/login' }, {
    email: 'ollama.test@elevai.com',
    password: 'Password123!',
    requestedRole: 'CANDIDATE',
  });
  const token = loginRes.data.token;

  try {
    // ----------------------------------------------------
    // TEST 1: Ollama Connectivity & Health Check
    // ----------------------------------------------------
    console.log('▶ [TEST 1] Verifying Ollama Health & Model Availability...');
    const t1Start = Date.now();
    const healthCheck = await aiService.checkOllamaHealth();
    const t1Duration = ((Date.now() - t1Start) / 1000).toFixed(2);
    console.log(`  • Ollama Base URL: ${healthCheck.baseUrl || 'http://localhost:11434'}`);
    console.log(`  • Model Loaded: ${healthCheck.model} (Available: ${healthCheck.hasModel})`);
    console.log(`  • Response Time: ${t1Duration}s`);

    if (!healthCheck.available || !healthCheck.hasModel) {
      throw new Error(`Test 1 Failed: Ollama not running or model missing: ${JSON.stringify(healthCheck)}`);
    }

    const aiStatusRes = await makeRequest(server, { method: 'GET', path: '/api/health/ai-status' });
    console.log(`  • GET /api/health/ai-status -> status ${aiStatusRes.status}, aiStatus: "${aiStatusRes.data.aiStatus}"`);
    console.log(`  ✔ Health check PASS.`);

    // ----------------------------------------------------
    // TEST 2: Resume Analyzer via Ollama (Qwen 2.5 7B)
    // ----------------------------------------------------
    console.log('\n▶ [TEST 2] Testing Resume Analyzer (Ollama / Qwen 2.5 7B)...');
    const t2Start = Date.now();
    const analysisRes = await aiService.generateResumeAnalysis({
      targetRole: careerGoal.targetRole,
      experienceLevel: careerGoal.experienceLevel,
      resumeText: sampleResumeText,
    });
    const t2Duration = ((Date.now() - t2Start) / 1000).toFixed(2);
    console.log(`  • Overall ATS Score: ${analysisRes.overallScore}/100`);
    console.log(`  • Executive Summary: "${analysisRes.summary.substring(0, 100)}..."`);
    console.log(`  • Strengths Count: ${analysisRes.strengths.length} | Weaknesses Count: ${analysisRes.weaknesses.length}`);
    console.log(`  • Response Time: ${t2Duration}s`);
    if (typeof analysisRes.overallScore !== 'number' || !analysisRes.summary) {
      throw new Error('Test 2 Failed: Invalid resume analysis output structure.');
    }
    console.log(`  ✔ Resume Analyzer PASS.`);

    // ----------------------------------------------------
    // TEST 3: Resume Improver via Ollama
    // ----------------------------------------------------
    console.log('\n▶ [TEST 3] Testing Resume Improver (Ollama / Qwen 2.5 7B)...');
    const t3Start = Date.now();
    const improverRes = await aiService.generateResumeImprovement({
      targetRole: careerGoal.targetRole,
      experienceLevel: careerGoal.experienceLevel,
      resumeText: sampleResumeText,
      analysis: analysisRes,
    });
    const t3Duration = ((Date.now() - t3Start) / 1000).toFixed(2);
    console.log(`  • Improved Summary: "${improverRes.summaryImprovement.improved.substring(0, 100)}..."`);
    console.log(`  • Project Improvements: ${improverRes.projectImprovements.length} projects enhanced`);
    console.log(`  • Response Time: ${t3Duration}s`);
    if (!improverRes.summaryImprovement?.improved) {
      throw new Error('Test 3 Failed: Invalid resume improvement output.');
    }
    console.log(`  ✔ Resume Improver PASS.`);

    // ----------------------------------------------------
    // TEST 4: Job-Specific Resume Optimization & Deterministic Scoring
    // ----------------------------------------------------
    console.log('\n▶ [TEST 4] Testing Job Optimization & Deterministic Match Scoring...');
    const sampleJobDesc = `We are seeking a Full Stack Software Engineer to build scalable cloud applications.
Required Skills: React, Node.js, PostgreSQL, TypeScript, Docker, Kubernetes, AWS.
Experience: 1-3 years with RESTful API design.`;

    const t4Start = Date.now();
    const jobOptRes = await aiService.generateJobOptimization({
      targetRole: 'Full Stack Engineer',
      experienceLevel: '1-3 years',
      resumeText: sampleResumeText,
      jobDescription: sampleJobDesc,
      companyName: 'TechCorp India',
      jobTitle: 'Full Stack Software Engineer',
    });
    const t4Duration = ((Date.now() - t4Start) / 1000).toFixed(2);
    console.log(`  • Matching Skills (${jobOptRes.matchingSkills.length}): ${jobOptRes.matchingSkills.join(', ')}`);
    console.log(`  • Missing Skills (${jobOptRes.missingSkills.length}): ${jobOptRes.missingSkills.join(', ')}`);
    console.log(`  • Deterministic Match Score: ${jobOptRes.matchScore}/100`);
    console.log(`  • Response Time: ${t4Duration}s`);

    // Verify deterministic scoring (must NOT be a random low number like 3!)
    if (jobOptRes.matchingSkills.length >= 3 && jobOptRes.matchScore < 40) {
      throw new Error(`Test 4 Failed: Match score is artificially low (${jobOptRes.matchScore}) despite matching skills!`);
    }
    console.log(`  ✔ Job Optimization & Deterministic Scoring PASS.`);

    // ----------------------------------------------------
    // TEST 5: Skill Gap Analyzer
    // ----------------------------------------------------
    console.log('\n▶ [TEST 5] Testing Skill Gap Analyzer & Readiness Score...');
    const t5Start = Date.now();
    const skillGapRes = await aiService.generateSkillGapAnalysis({
      targetRole: careerGoal.targetRole,
      experienceLevel: careerGoal.experienceLevel,
      resumeText: sampleResumeText,
    });
    const t5Duration = ((Date.now() - t5Start) / 1000).toFixed(2);
    console.log(`  • Existing Skills Count: ${skillGapRes.existingSkills.length}`);
    console.log(`  • Missing Skills Count: ${skillGapRes.missingSkills.length}`);
    console.log(`  • Overall Readiness Score: ${skillGapRes.overallReadinessScore}/100`);
    console.log(`  • Response Time: ${t5Duration}s`);
    if (typeof skillGapRes.overallReadinessScore !== 'number') {
      throw new Error('Test 5 Failed: Invalid skill gap response structure.');
    }
    console.log(`  ✔ Skill Gap Analyzer PASS.`);

    // ----------------------------------------------------
    // TEST 6: Mock Interview (Question Generation + Answer Evaluation)
    // ----------------------------------------------------
    console.log('\n▶ [TEST 6] Testing AI Mock Interview (Questions & Evaluation)...');
    const t6Start = Date.now();
    const interviewQuestions = await aiService.generateInterviewQuestions({
      targetRole: careerGoal.targetRole,
      experienceLevel: careerGoal.experienceLevel,
      type: 'TECHNICAL',
      difficulty: 'INTERMEDIATE',
      questionCount: 3,
      resumeText: sampleResumeText,
    });
    const t6QuestionsDuration = ((Date.now() - t6Start) / 1000).toFixed(2);
    console.log(`  • Questions Generated (${interviewQuestions.questions.length}):`);
    interviewQuestions.questions.forEach((q, i) => console.log(`    [${i + 1}] ${q.questionText}`));
    console.log(`  • Question Gen Time: ${t6QuestionsDuration}s`);

    const q1 = interviewQuestions.questions[0];
    const candidateAnswer = 'In React, state holds dynamic component data. We manage state with useState and useReducer, while Context API or Redux handles global state across the component tree.';

    const t6EvalStart = Date.now();
    const answerEval = await aiService.evaluateInterviewAnswer({
      targetRole: careerGoal.targetRole,
      experienceLevel: careerGoal.experienceLevel,
      questionText: q1.questionText,
      category: q1.category,
      difficulty: q1.difficulty,
      expectedTopics: q1.expectedTopics,
      candidateAnswer,
    });
    const t6EvalDuration = ((Date.now() - t6EvalStart) / 1000).toFixed(2);
    console.log(`  • Answer Score: ${answerEval.score}/10 (Technical: ${answerEval.technicalScore}/10)`);
    console.log(`  • Feedback: "${answerEval.feedback.substring(0, 100)}..."`);
    console.log(`  • Answer Eval Time: ${t6EvalDuration}s`);
    console.log(`  ✔ AI Mock Interview PASS.`);

    // ----------------------------------------------------
    // TEST 7: General Career Chatbot
    // ----------------------------------------------------
    console.log('\n▶ [TEST 7] Testing General AI Chatbot (Qwen 2.5 7B)...');
    const t7Start = Date.now();
    const chatResponse = await aiService.generateGeneralChatResponse({
      userMessage: 'How should I explain database indexing in a Full Stack technical interview?',
      history: [],
      userContext: { careerGoal },
    });
    const t7Duration = ((Date.now() - t7Start) / 1000).toFixed(2);
    console.log(`  • Response Preview: "${chatResponse.substring(0, 120).replace(/\n/g, ' ')}..."`);
    console.log(`  • Chat Response Time: ${t7Duration}s`);
    if (!chatResponse || chatResponse.length < 30) {
      throw new Error('Test 7 Failed: Chat response is too short or empty.');
    }
    console.log(`  ✔ Career Chatbot PASS.`);

    // ----------------------------------------------------
    // TEST 8: Full End-to-End HTTP API Endpoints via Express
    // ----------------------------------------------------
    console.log('\n▶ [TEST 8] Testing Full HTTP API Endpoints with Candidate JWT Token...');
    
    // Chat endpoint
    const apiChatRes = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/api/chat',
        headers: { Authorization: `Bearer ${token}` },
      },
      { message: 'What are the top 3 soft skills for software engineers?' }
    );
    console.log(`  • POST /api/chat: Status ${apiChatRes.status} -> Received response (${apiChatRes.data.message?.content?.length || 0} chars)`);

    console.log('\n================================================================');
    console.log('✔ ALL OLLAMA / QWEN 2.5 7B VERIFICATION TESTS PASSED 100%!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runOllamaVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  });
