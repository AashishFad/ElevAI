/**
 * Comprehensive RBAC & Admin Authorization Test Suite
 */
require('dotenv').config();
const { generateToken, verifyToken } = require('../src/utils/jwt');
const authMiddleware = require('../src/middleware/authMiddleware');
const { requireRole, requireAdmin } = require('../src/middleware/roleMiddleware');

function runRBACTests() {
  console.log('====================================================');
  console.log('ELEVAI PHASE 1: RBAC & ADMIN AUTHORIZATION TEST SUITE');
  console.log('====================================================\n');

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

  // TEST 1: JWT Role Embedding
  console.log('1. Testing JWT Token Role Generation & Verification:');
  const userPayload = { userId: 'user-123', role: 'USER', email: 'student@elevai.com' };
  const adminPayload = { userId: 'admin-456', role: 'ADMIN', email: 'admin@elevai.com' };

  const userToken = generateToken(userPayload);
  const adminToken = generateToken(adminPayload);

  const decodedUser = verifyToken(userToken);
  const decodedAdmin = verifyToken(adminToken);

  assert(decodedUser && decodedUser.role === 'USER', 'Student token contains role: USER');
  assert(decodedAdmin && decodedAdmin.role === 'ADMIN', 'Admin token contains role: ADMIN');
  assert(decodedUser.userId === 'user-123', 'User ID matches in decoded student token');
  assert(decodedAdmin.userId === 'admin-456', 'User ID matches in decoded admin token');

  // TEST 2: authMiddleware Execution
  console.log('\n2. Testing authMiddleware Extraction:');
  let authNextCalled = false;
  const mockReqUser = {
    headers: { authorization: `Bearer ${userToken}` },
  };
  const mockRes = {
    status: (code) => ({
      json: (data) => ({ code, data }),
    }),
  };

  authMiddleware(mockReqUser, mockRes, () => {
    authNextCalled = true;
  });

  assert(authNextCalled, 'authMiddleware calls next() on valid token');
  assert(mockReqUser.user && mockReqUser.user.role === 'USER', 'authMiddleware populates req.user.role = USER');

  // TEST 3: RBAC Middleware (403 Forbidden for Student)
  console.log('\n3. Testing requireAdmin with Normal Student User (Scenario 2):');
  let studentAllowed = false;
  let studentStatusCode = null;
  let studentResponseBody = null;

  const mockResStudent = {
    status: (code) => {
      studentStatusCode = code;
      return {
        json: (body) => {
          studentResponseBody = body;
          return body;
        },
      };
    },
  };

  requireAdmin(mockReqUser, mockResStudent, () => {
    studentAllowed = true;
  });

  assert(!studentAllowed, 'Normal user is blocked from executing admin route handler');
  assert(studentStatusCode === 403, 'Normal user receives HTTP 403 Forbidden');
  assert(
    studentResponseBody && studentResponseBody.success === false,
    'Response body returns success: false'
  );

  // TEST 4: RBAC Middleware (200 / Next for Admin)
  console.log('\n4. Testing requireAdmin with Admin User (Scenario 3):');
  let adminAllowed = false;
  const mockReqAdmin = {
    headers: { authorization: `Bearer ${adminToken}` },
  };

  authMiddleware(mockReqAdmin, mockRes, () => {});
  requireAdmin(mockReqAdmin, mockRes, () => {
    adminAllowed = true;
  });

  assert(adminAllowed, 'Admin user successfully passes requireAdmin middleware');
  assert(mockReqAdmin.user.role === 'ADMIN', 'Admin user payload verified with role: ADMIN');

  // TEST 5: Role Middleware Multi-Role Check
  console.log('\n5. Testing generic requireRole helper:');
  const customRoleMiddleware = requireRole('SUPERADMIN', 'ADMIN');
  let multiRolePassed = false;
  customRoleMiddleware(mockReqAdmin, mockRes, () => {
    multiRolePassed = true;
  });
  assert(multiRolePassed, 'requireRole matches user against list of allowed roles');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRBACTests();
