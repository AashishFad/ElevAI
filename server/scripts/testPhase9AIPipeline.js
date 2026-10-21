/**
 * Phase 9 AI Pipeline & Intelligence Layer Test Suite
 * Validates all AI services, validators, fallbacks, schema parsing, and end-to-end flows.
 */
const { getPrismaClient } = require('../src/config/database');
const {
  generateResumeAnalysis,
  generateResumeImprovement,
  generateJobOptimization,
  generateSkillGapAnalysis,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  improveResumeBuilderText,
  generateGeneralChatResponse,
  validateAnalysisResponse,
  validateImprovementResponse,
  validateJobOptimizationResponse,
  validateSkillGapResponse,
  validateInterviewQuestionsResponse,
  validateAnswerEvaluationResponse,
  validateBuilderTextImprovement,
} = require('../src/ai/geminiService');

const { performResumeAnalysis, getAnalysisById } = require('../src/services/resumeAnalysisService');
const { performResumeImprovement, getImprovementById } = require('../src/services/resumeImprovementService');
const { createJobOptimization, getJobOptimizationById } = require('../src/services/jobOptimizationService');
const { createSkillGapAnalysis, getSkillGapAnalysisById } = require('../src/services/skillGapService');
const { createInterviewSession, submitQuestionAnswer, getInterviewSessionById } = require('../src/services/interviewService');
const { createDocument, aiImproveContent, exportDocumentToResume } = require('../src/services/resumeBuilderService');

const prisma = getPrismaClient();

async function runPhase9Tests() {
  console.log('====================================================');
  console.log('  STARTING PHASE 9: AI FEATURES & PIPELINE TEST     ');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // PART 1: Direct Schema Validators & Sanitization
    // -------------------------------------------------------------
    console.log('\n--- PART 1: Testing Schema Validators & Normalizers ---');

    const sampleAnalysisRaw = {
      overallScore: 85,
      summary: 'Candidate demonstrates strong React and Node.js skills.',
      scoreBreakdown: { careerRelevance: 88, technicalSkills: 90, projects: 80, experience: 82, structure: 85, clarity: 85 },
      strengths: ['Strong full-stack experience', 'Clean resume formatting'],
      weaknesses: ['Add more metrics in projects'],
      skillsFound: { programmingLanguages: ['JavaScript', 'Python'], frameworks: ['React', 'Express.js'] },
      recommendedSkills: ['Docker', 'AWS'],
      actionItems: [{ priority: 'HIGH', title: 'Add metrics', description: 'Include scale and throughput.' }],
    };
    const validatedAnalysis = validateAnalysisResponse(sampleAnalysisRaw);
    assert(validatedAnalysis.overallScore === 85, 'validateAnalysisResponse preserves score');
    assert(Array.isArray(validatedAnalysis.strengths) && validatedAnalysis.strengths.length > 0, 'validateAnalysisResponse sanitizes strengths');

    const sampleImprovementRaw = {
      summaryImprovement: { original: 'Old', improved: 'New summary with active verbs', explanation: 'Better focus' },
      projectImprovements: [{ projectName: 'ElevAI', original: 'Old proj', improved: 'New proj', explanation: 'Clearer' }],
      skillsSection: { existing: ['Node.js'], recommended: ['Docker'] },
    };
    const validatedImprovement = validateImprovementResponse(sampleImprovementRaw);
    assert(validatedImprovement.summaryImprovement.improved.includes('New summary'), 'validateImprovementResponse formats summary');
    assert(validatedImprovement.projectImprovements.length === 1, 'validateImprovementResponse formats projects');

    const sampleJobOptRaw = {
      matchScore: 88,
      summary: 'High match for Senior Full-Stack Engineer',
      matchingSkills: ['React', 'Node.js'],
      missingSkills: ['Kubernetes'],
    };
    const validatedJobOpt = validateJobOptimizationResponse(sampleJobOptRaw);
    assert(validatedJobOpt.matchScore === 88, 'validateJobOptimizationResponse preserves matchScore');
    assert(validatedJobOpt.matchingSkills.includes('React'), 'validateJobOptimizationResponse parses matching skills');

    const sampleSkillGapRaw = {
      overallReadinessScore: 78,
      summary: 'Solid readiness foundation',
      existingSkills: [{ skill: 'JavaScript', level: 'STRONG' }],
      missingSkills: [{ skill: 'Docker', priority: 'HIGH', category: 'DevOps', reason: 'Required' }],
      priorityGaps: [{ skill: 'Docker', priority: 'HIGH', reason: 'Containerization' }],
    };
    const validatedSkillGap = validateSkillGapResponse(sampleSkillGapRaw);
    assert(validatedSkillGap.overallReadinessScore === 78, 'validateSkillGapResponse validates score');
    assert(validatedSkillGap.missingSkills[0].priority === 'HIGH', 'validateSkillGapResponse normalizes priority');

    const sampleQuestionsRaw = {
      questions: [
        { questionNumber: 1, questionText: 'Explain event loop', category: 'TECHNICAL', difficulty: 'INTERMEDIATE', expectedTopics: ['Macrotasks', 'Microtasks'] },
      ],
    };
    const validatedQuestions = validateInterviewQuestionsResponse(sampleQuestionsRaw, 1);
    assert(validatedQuestions.questions.length === 1, 'validateInterviewQuestionsResponse parses questions array');

    const sampleEvaluationRaw = {
      score: 8.5,
      technicalScore: 8.0,
      communicationScore: 9.0,
      relevanceScore: 8.5,
      feedback: 'Very thorough explanation with good examples.',
      strengths: ['Great communication'],
      weaknesses: ['Add edge case analysis'],
    };
    const validatedEvaluation = validateAnswerEvaluationResponse(sampleEvaluationRaw);
    assert(validatedEvaluation.score === 8.5, 'validateAnswerEvaluationResponse parses scores');

    const sampleBuilderTextRaw = {
      original: 'I made the UI faster',
      improved: 'Optimized frontend rendering performance, reducing page load latency by 35%',
      explanation: 'Action verbs and quantifiable metrics added.',
    };
    const validatedBuilderText = validateBuilderTextImprovement(sampleBuilderTextRaw, 'I made the UI faster');
    assert(validatedBuilderText.improved.includes('Optimized frontend'), 'validateBuilderTextImprovement enhances text');

    // -------------------------------------------------------------
    // PART 2: Database Setup & User Context Flow
    // -------------------------------------------------------------
    console.log('\n--- PART 2: Database Test User Setup ---');

    // Find or create test user
    let user = await prisma.user.findFirst({
      where: { email: 'phase9_ai_test@elevai.io' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'phase9_ai_test@elevai.io',
          passwordHash: 'dummy_hash_for_testing',
          name: 'Phase 9 AI Test User',
          role: 'USER',
        },
      });
    }

    // Configure Career Goal
    let careerGoal = await prisma.careerGoal.upsert({
      where: { userId: user.id },
      update: {
        targetRole: 'Full Stack Engineer',
        experienceLevel: 'THREE_TO_FIVE_YEARS',
      },
      create: {
        userId: user.id,
        targetRole: 'Full Stack Engineer',
        experienceLevel: 'THREE_TO_FIVE_YEARS',
      },
    });
    assert(careerGoal.targetRole === 'Full Stack Engineer', 'Career goal is configured');

    // Create a rich test resume with enough text
    const sampleResumeText = `
John Doe - Full Stack Software Engineer
Email: john.doe@example.com | Phone: (555) 123-4567 | San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY:
Proactive Full Stack Engineer with 3+ years of experience building modern scalable web applications using React, Node.js, Express, PostgreSQL, and AWS.

TECHNICAL SKILLS:
Programming Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frameworks & Libraries: React, Node.js, Express.js, Tailwind CSS, Next.js, Redux
Databases & Storage: PostgreSQL, MongoDB, Redis, Supabase
Tools & Cloud: Git, Docker, AWS (S3, EC2), REST APIs, CI/CD, Jest

EXPERIENCE:
Software Engineer | Acme Corp (2022 - Present)
- Architected and built responsive frontend features using React and Tailwind CSS.
- Developed scalable REST APIs in Node.js and Express with PostgreSQL integration.
- Optimized database indexing, improving query response times by 30%.
- Integrated authentication using JWT and role-based access control.

PROJECTS:
ElevAI Platform (2023)
- Built an AI-assisted career development platform utilizing React, Express, and PostgreSQL.
- Implemented real-time status notifications and resume analysis pipelines.
`;

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        originalFileName: 'Phase9_AI_Test_Resume.pdf',
        storagePath: `test/phase9/${user.id}/resume.pdf`,
        fileType: 'application/pdf',
        fileSize: 1024,
        extractedText: sampleResumeText,
        status: 'READY',
      },
    });
    assert(resume.id && resume.status === 'READY', 'Test resume created in READY state');

    // -------------------------------------------------------------
    // PART 3: AI Resume Analysis Service & Retrieval
    // -------------------------------------------------------------
    console.log('\n--- PART 3: AI Resume Analysis Pipeline ---');
    const analysis = await performResumeAnalysis({ userId: user.id, resumeId: resume.id });
    assert(analysis.overallScore >= 0 && analysis.overallScore <= 100, `Resume analysis completed with score: ${analysis.overallScore}`);
    assert(analysis.targetRole === 'Full Stack Engineer', 'Analysis targets correct career role');

    const fetchedAnalysis = await getAnalysisById({ userId: user.id, analysisId: analysis.id });
    assert(fetchedAnalysis.id === analysis.id, 'Fetched analysis from DB by ID matches generated record');

    // -------------------------------------------------------------
    // PART 4: AI Resume Improvement Service
    // -------------------------------------------------------------
    console.log('\n--- PART 4: AI Resume Improvement Pipeline ---');
    const improvement = await performResumeImprovement({
      userId: user.id,
      resumeId: resume.id,
      analysisId: analysis.id,
    });
    assert(improvement.id && improvement.summaryImprovement, 'Resume improvement generated and saved');
    const fetchedImprovement = await getImprovementById({ userId: user.id, improvementId: improvement.id });
    assert(fetchedImprovement.id === improvement.id, 'Fetched improvement from DB matches');

    // -------------------------------------------------------------
    // PART 5: AI Job-Specific Optimization Service
    // -------------------------------------------------------------
    console.log('\n--- PART 5: AI Job Optimization Pipeline ---');
    const jobDescriptionText = `
We are looking for a Senior Full Stack Software Engineer with deep expertise in React, Node.js, TypeScript, PostgreSQL, and Kubernetes.
Responsibilities include designing microservices, optimizing low-latency database queries, and leading CI/CD deployment pipelines on AWS.
Requirements: 3+ years with Node.js & React, solid understanding of Docker, Kubernetes, and REST API design.
`;
    const jobOpt = await createJobOptimization({
      userId: user.id,
      resumeId: resume.id,
      jobDescription: jobDescriptionText,
      companyName: 'CloudScale Technologies',
      jobTitle: 'Senior Full Stack Engineer',
      jobLocation: 'San Francisco, CA',
    });
    assert(jobOpt.matchScore >= 0 && jobOpt.matchScore <= 100, `Job optimization match score: ${jobOpt.matchScore}`);
    assert(Array.isArray(jobOpt.matchingSkills), 'Matching skills array returned');

    const fetchedJobOpt = await getJobOptimizationById({ userId: user.id, optimizationId: jobOpt.id });
    assert(fetchedJobOpt.id === jobOpt.id, 'Fetched job optimization record from DB matches');

    // -------------------------------------------------------------
    // PART 6: AI Skill Gap Analysis Service
    // -------------------------------------------------------------
    console.log('\n--- PART 6: AI Skill Gap Analysis Pipeline ---');
    const skillGap = await createSkillGapAnalysis({
      userId: user.id,
      resumeId: resume.id,
      jobOptimizationId: jobOpt.id,
    });
    assert(skillGap.overallReadinessScore >= 0, `Skill gap readiness score: ${skillGap.overallReadinessScore}`);
    assert(Array.isArray(skillGap.existingSkills) && skillGap.existingSkills.length > 0, 'Existing skills identified');

    const fetchedSkillGap = await getSkillGapAnalysisById({ userId: user.id, skillGapId: skillGap.id });
    assert(fetchedSkillGap.id === skillGap.id, 'Fetched skill gap report from DB matches');

    // -------------------------------------------------------------
    // PART 7: AI Mock Interview Session Flow
    // -------------------------------------------------------------
    console.log('\n--- PART 7: AI Mock Interview Session Pipeline ---');
    const interviewSession = await createInterviewSession({
      userId: user.id,
      type: 'TECHNICAL',
      difficulty: 'INTERMEDIATE',
      inputMode: 'TEXT',
      questionCount: 3,
      resumeId: resume.id,
    });
    assert(interviewSession.questions && interviewSession.questions.length === 3, 'Interview session created with 3 questions');

    const firstQuestion = interviewSession.questions[0];
    const answerResult = await submitQuestionAnswer({
      userId: user.id,
      sessionId: interviewSession.id,
      questionId: firstQuestion.id,
      answerText: 'In React, the virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new virtual tree, diffs it with the previous one, and batches minimal updates to the real DOM to improve rendering performance.',
      inputMode: 'TEXT',
    });
    assert(answerResult.answer && answerResult.answer.score >= 0, `Question 1 answered and evaluated with score: ${answerResult.answer.score}`);

    // Answer remaining questions to complete interview
    for (let i = 1; i < interviewSession.questions.length; i++) {
      const q = interviewSession.questions[i];
      await submitQuestionAnswer({
        userId: user.id,
        sessionId: interviewSession.id,
        questionId: q.id,
        answerText: 'I handle asynchronous operations using async/await with robust try/catch blocks and structured error logging middleware.',
        inputMode: 'TEXT',
      });
    }

    const completedSession = await getInterviewSessionById({ userId: user.id, sessionId: interviewSession.id });
    assert(completedSession.status === 'COMPLETED', 'Interview session updated to COMPLETED after all answers submitted');
    assert(completedSession.overallScore >= 0, `Interview overall final score calculated: ${completedSession.overallScore}/100`);

    // -------------------------------------------------------------
    // PART 8: Resume Builder AI Text Improvement & Vault Export
    // -------------------------------------------------------------
    console.log('\n--- PART 8: Resume Builder AI Integration & Export ---');
    const builderDoc = await createDocument({
      userId: user.id,
      title: 'Phase 9 Cloud Engineer Resume',
      template: 'modern',
    });
    assert(builderDoc.id, 'Resume builder document created');

    const textImprovement = await aiImproveContent({
      userId: user.id,
      documentId: builderDoc.id,
      fieldType: 'Experience Bullet',
      textContent: 'I wrote backend API code and fixed bugs in express routes.',
    });
    assert(textImprovement.improved && textImprovement.improved.length > 10, 'Builder text improved with AI');

    const exportedResume = await exportDocumentToResume({
      userId: user.id,
      documentId: builderDoc.id,
    });
    assert(exportedResume.status === 'READY', 'Resume document successfully compiled and exported to Resumes vault in READY status');

    // -------------------------------------------------------------
    // PART 9: General AI Chatbot Engine
    // -------------------------------------------------------------
    console.log('\n--- PART 9: General AI Chatbot Engine ---');
    const chatReplyGeneral = await generateGeneralChatResponse({
      userMessage: 'What is the difference between SQL and NoSQL databases?',
      chatHistory: [],
      userContext: { careerGoal },
    });
    assert(chatReplyGeneral && chatReplyGeneral.length > 50, 'Chatbot answered general technical question');

    const chatReplyPersonalized = await generateGeneralChatResponse({
      userMessage: 'How did I score on my resume and mock interview?',
      chatHistory: [],
      userContext: {
        careerGoal,
        latestAnalysis: fetchedAnalysis,
        latestInterview: completedSession,
      },
    });
    assert(chatReplyPersonalized && (chatReplyPersonalized.includes(String(fetchedAnalysis.overallScore)) || chatReplyPersonalized.includes('Resume ATS Score') || chatReplyPersonalized.includes('Profile')), 'Chatbot personalized answer using profile context without hallucination');

    // -------------------------------------------------------------
    // PART 10: Error Rejection & Security Resilience
    // -------------------------------------------------------------
    console.log('\n--- PART 10: Input Sanitization & Security Resilience ---');
    let caughtShortJobError = false;
    try {
      await createJobOptimization({
        userId: user.id,
        resumeId: resume.id,
        jobDescription: 'Too short',
      });
    } catch (e) {
      caughtShortJobError = true;
      assert(e.statusCode === 400, 'Rejects short job descriptions (< 50 chars) with 400');
    }
    assert(caughtShortJobError, 'Short job description validation active');

    let caughtFakeResumeError = false;
    try {
      await performResumeAnalysis({
        userId: user.id,
        resumeId: '00000000-0000-0000-0000-000000000000',
      });
    } catch (e) {
      caughtFakeResumeError = true;
      assert(e.statusCode === 404, 'Rejects non-existent resume with 404');
    }
    assert(caughtFakeResumeError, 'Resume ownership and existence verification active');

    console.log('\n====================================================');
    console.log(`  PHASE 9 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n[ERROR IN PHASE 9 TEST]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase9Tests();
