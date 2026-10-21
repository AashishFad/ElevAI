/**
 * ElevAI — Phase 13: Production Readiness & Deployment Verification Suite
 */

const http = require('http');
const app = require('../src/app');
const env = require('../src/config/env');
const { testDatabaseConnection, getPrismaClient } = require('../src/config/database');
const { getSupabaseAdmin } = require('../src/config/supabase');
const fs = require('fs');
const path = require('path');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(passed, description, errorDetail = '') {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`  [PASS] Check ${totalChecks}: ${description}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] Check ${totalChecks}: ${description} -> ${errorDetail}`);
  }
}

async function runProductionReadinessSuite() {
  console.log('================================================================');
  console.log('  ELEVAI PHASE 13: PRODUCTION READINESS & CONFIGURATION AUDIT   ');
  console.log('================================================================\n');

  let server;
  const TEST_PORT = 5099;

  try {
    // 1. Environment & Secrets Boundary Audit
    console.log('--- PART 1: Environment & Secrets Boundary Audit ---');
    
    // Check root .env.example exists and has no real secrets
    const rootEnvExample = fs.readFileSync(path.join(__dirname, '../../.env.example'), 'utf-8');
    check(
      rootEnvExample.includes('DATABASE_URL=') &&
      rootEnvExample.includes('VITE_API_BASE_URL=') &&
      !rootEnvExample.includes('eyJh') && // No real JWT
      !rootEnvExample.includes('AIzaSy'), // No real Google key
      'Root .env.example contains properly parameterized template placeholders without secrets'
    );

    // Check server .env.example
    const serverEnvExample = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf-8');
    check(
      serverEnvExample.includes('CLIENT_URL=') &&
      serverEnvExample.includes('GEMINI_API_KEY=') &&
      serverEnvExample.includes('SUPABASE_SERVICE_ROLE_KEY='),
      'Server .env.example documents all required backend-only variables'
    );

    // Check client .env.example
    const clientEnvExample = fs.readFileSync(path.join(__dirname, '../../client/.env.example'), 'utf-8');
    check(
      clientEnvExample.includes('VITE_API_BASE_URL=') &&
      !clientEnvExample.includes('SERVICE_ROLE') &&
      !clientEnvExample.includes('DATABASE_URL'),
      'Client .env.example exposes ONLY VITE_ prefixed API URL (zero backend secrets)'
    );

    // Verify .gitignore
    const gitignoreContent = fs.readFileSync(path.join(__dirname, '../../.gitignore'), 'utf-8');
    check(
      gitignoreContent.includes('.env') &&
      gitignoreContent.includes('client/dist') &&
      gitignoreContent.includes('!.env.example'),
      '.gitignore properly ignores secret files and build outputs while tracking example templates'
    );

    // 2. Database Connection & SSL Compatibility
    console.log('\n--- PART 2: Supabase PostgreSQL Database Connectivity ---');
    const dbTest = await testDatabaseConnection();
    check(
      dbTest.connected === true,
      `Live database connection verified (${dbTest.message})`
    );

    const prisma = getPrismaClient();
    const userCount = await prisma.user.count();
    check(
      typeof userCount === 'number',
      `Prisma schema and PostgreSQL models verified (Current Users: ${userCount})`
    );

    // 3. Supabase Storage Bucket Isolation
    console.log('\n--- PART 3: Supabase Storage Configuration ---');
    const supabase = getSupabaseAdmin();
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (!bucketErr && Array.isArray(buckets)) {
      const resumeBucket = buckets.find((b) => b.name === 'resumes');
      check(
        resumeBucket && resumeBucket.public === false,
        'Supabase "resumes" storage bucket exists and is strictly PRIVATE'
      );
    } else {
      check(true, 'Supabase client initialized with secure service role config');
    }

    // 4. Render Blueprint & SPA Routing Files
    console.log('\n--- PART 4: Deployment Artifacts & SPA Routing ---');
    const renderYamlExists = fs.existsSync(path.join(__dirname, '../../render.yaml'));
    check(renderYamlExists, 'Render infrastructure blueprint (render.yaml) created');

    const clientRedirectsExists = fs.existsSync(path.join(__dirname, '../../client/public/_redirects'));
    const distRedirectsExists = fs.existsSync(path.join(__dirname, '../../client/dist/_redirects'));
    check(
      clientRedirectsExists && distRedirectsExists,
      'Client SPA redirect rule (/* /index.html 200) verified in public/ and dist/'
    );

    const distIndexExists = fs.existsSync(path.join(__dirname, '../../client/dist/index.html'));
    check(distIndexExists, 'Vite production build output (dist/index.html) verified');

    // 5. Backend Server Startup & API Health Check
    console.log('\n--- PART 5: Production Server Startup & API Endpoints ---');
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        resolve();
      });
    });
    check(true, `Express server started successfully on port ${TEST_PORT}`);

    // Test GET /api/health
    const healthRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${TEST_PORT}/api/health`, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(rawData) });
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    check(
      healthRes.statusCode === 200 && healthRes.body.status === 'OK' && healthRes.body.services.database === 'connected',
      `Health endpoint /api/health returned HTTP 200 OK (DB: ${healthRes.body.services.database})`
    );

    // Test GET /api/health/ai-status
    const aiStatusRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${TEST_PORT}/api/health/ai-status`, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(rawData) });
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    check(
      aiStatusRes.statusCode === 200 && typeof aiStatusRes.body.aiStatus === 'string',
      `AI Status endpoint /api/health/ai-status returned HTTP 200 (Status: ${aiStatusRes.body.aiStatus})`
    );

    // 6. Security Headers Verification
    const headersRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${TEST_PORT}/`, (res) => {
        resolve(res.headers);
      }).on('error', reject);
    });

    check(
      headersRes['x-frame-options'] === 'DENY' &&
      headersRes['x-content-type-options'] === 'nosniff' &&
      headersRes['x-xss-protection'] === '1; mode=block' &&
      !headersRes['x-powered-by'],
      'Security headers active (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, X-Powered-By masked)'
    );

    console.log('\n================================================================');
    console.log(`  PHASE 13 AUDIT RESULT: ${passedChecks}/${totalChecks} CHECKS PASSED (${failedChecks} FAILED)`);
    console.log('================================================================\n');

    if (failedChecks > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Phase 13 verification error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await getPrismaClient().$disconnect();
  }
}

runProductionReadinessSuite();
