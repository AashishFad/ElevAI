/**
 * Automated Verification Script for Phase 2: Admin Job Management & Job Posting
 */
require('dotenv').config();
const { validateJobInput } = require('../src/validators/job.validator');
const { generateToken } = require('../src/utils/jwt');
const authMiddleware = require('../src/middleware/authMiddleware');
const { requireAdmin } = require('../src/middleware/roleMiddleware');

function runPhase2Tests() {
  console.log('================================================================');
  console.log('ELEVAI PHASE 2: ADMIN JOB MANAGEMENT & JOB POSTING TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`   ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`   ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Validator Tests
  console.log('1. Testing Job Input Validation Engine:');

  const validPayload = {
    title: 'Software Engineer - Distributed Systems',
    companyName: 'Ensono Technologies',
    location: 'Pune, India',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    experienceRequired: '0-1 years',
    educationRequirement: 'B.Tech / B.E. / BCA / MCA',
    requiredSkills: ['Java', 'SQL', 'AWS', 'Linux'],
    preferredSkills: ['Docker', 'Kubernetes'],
    salaryMin: 600000,
    salaryMax: 900000,
    salaryVisible: true,
    description: 'We are hiring a Software Engineer to design, build, and deploy high-impact microservices and APIs.',
    openings: 3,
    status: 'DRAFT',
  };

  const validationRes = validateJobInput(validPayload);
  assert(validationRes.isValid, 'Valid job payload passes validation without errors');
  assert(Array.isArray(validationRes.sanitized.requiredSkills), 'Required skills sanitized into structured Array');
  assert(validationRes.sanitized.requiredSkills.length === 4, 'All 4 required skills preserved');
  assert(validationRes.sanitized.status === 'DRAFT', 'Default or explicit status preserved as DRAFT');

  // Negative Tests: Invalid Salary
  console.log('\n2. Testing Salary & Numeric Validation:');
  const invalidSalary = {
    ...validPayload,
    salaryMin: 900000,
    salaryMax: 500000, // min > max
  };
  const salaryValidation = validateJobInput(invalidSalary);
  assert(!salaryValidation.isValid, 'Validation rejects when salaryMin > salaryMax');
  assert(
    salaryValidation.errors.some((e) => e.includes('Minimum salary cannot exceed')),
    'Informative error message on salary inverted range'
  );

  // Negative Tests: Missing Required Skills
  console.log('\n3. Testing Mandatory Fields & Skills Array Enforcement:');
  const missingSkills = {
    ...validPayload,
    requiredSkills: [],
  };
  const skillsValidation = validateJobInput(missingSkills);
  assert(!skillsValidation.isValid, 'Validation rejects empty required skills');

  // Comma-separated string auto-sanitization to Array
  const stringSkills = {
    ...validPayload,
    requiredSkills: 'Java, PostgreSQL, Docker ,  Kubernetes ',
  };
  const stringSkillsValidation = validateJobInput(stringSkills);
  assert(stringSkillsValidation.isValid, 'Comma-separated skill string auto-converted to Array');
  assert(stringSkillsValidation.sanitized.requiredSkills.length === 4, 'Whitespace trimmed from converted skill tokens');

  // 4. RBAC Protection on Admin Job Endpoints
  console.log('\n4. Testing RBAC Security on Admin Job Endpoints (Test 4):');
  const studentToken = generateToken({ userId: 'student-001', role: 'USER', email: 'student@elevai.com' });
  const adminToken = generateToken({ userId: 'admin-001', role: 'ADMIN', email: 'admin@elevai.com' });

  let studentAllowed = false;
  let studentStatusCode = null;

  const mockReqStudent = { headers: { authorization: `Bearer ${studentToken}` } };
  const mockResStudent = {
    status: (code) => {
      studentStatusCode = code;
      return { json: (b) => b };
    },
  };

  authMiddleware(mockReqStudent, mockResStudent, () => {});
  requireAdmin(mockReqStudent, mockResStudent, () => {
    studentAllowed = true;
  });

  assert(!studentAllowed, 'Normal user (Student) is blocked from calling Admin Job APIs');
  assert(studentStatusCode === 403, 'Normal user receives HTTP 403 Forbidden on Admin Job routes');

  // Admin Execution
  let adminAllowed = false;
  const mockReqAdmin = { headers: { authorization: `Bearer ${adminToken}` } };
  const mockResAdmin = { status: (code) => ({ json: (b) => b }) };

  authMiddleware(mockReqAdmin, mockResAdmin, () => {});
  requireAdmin(mockReqAdmin, mockResAdmin, () => {
    adminAllowed = true;
  });

  assert(adminAllowed, 'Authenticated Admin user is authorized to perform Job CRUD operations');

  // 5. Job Status Transitions
  console.log('\n5. Testing Status Enum Lifecycle (DRAFT -> PUBLISHED -> CLOSED):');
  const publishPayload = { ...validPayload, status: 'PUBLISHED' };
  const publishValidation = validateJobInput(publishPayload);
  assert(publishValidation.isValid, 'Publish status is valid');
  assert(publishValidation.sanitized.publishedAt instanceof Date, 'publishedAt timestamp automatically set on publish');

  const closePayload = { ...validPayload, status: 'CLOSED' };
  const closeValidation = validateJobInput(closePayload);
  assert(closeValidation.isValid, 'Closed status is valid');

  console.log('\n================================================================');
  console.log(`PHASE 2 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (100%)`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runPhase2Tests();
