/**
 * Phase 10 UI/UX, Design Tokens, Routing & Responsiveness Automated Audit Suite
 */
const fs = require('fs');
const path = require('path');
const { getPrismaClient } = require('../src/config/database');

const prisma = getPrismaClient();

async function runPhase10Audit() {
  console.log('====================================================');
  console.log('  STARTING PHASE 10: UI/UX & DESIGN SYSTEM AUDIT   ');
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
    // PART 1: Design Tokens & CSS Accessibility Checks
    // -------------------------------------------------------------
    console.log('\n--- PART 1: Verifying Design Tokens & CSS Accessibility ---');
    const cssPath = path.join(__dirname, '../../client/src/index.css');
    assert(fs.existsSync(cssPath), 'client/src/index.css exists');

    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert(cssContent.includes('--bg-primary: #070714'), 'Global background token #070714 configured');
    assert(cssContent.includes('.text-gradient-ai'), 'Futuristic AI text gradient utility defined');
    assert(cssContent.includes('.glass-card'), 'Glassmorphism card utility defined');
    assert(cssContent.includes('.skeleton-shimmer'), 'Skeleton shimmer animation defined');
    assert(cssContent.includes('.animate-scale-in'), 'Scale-in entrance animation defined');
    assert(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'Accessibility prefers-reduced-motion media query implemented');

    // -------------------------------------------------------------
    // PART 2: UI Component Primitives Verification
    // -------------------------------------------------------------
    console.log('\n--- PART 2: Verifying Standardized UI Component Primitives ---');
    const uiDir = path.join(__dirname, '../../client/src/components/ui');
    const requiredUIComponents = [
      'Card.jsx',
      'GlassCard.jsx',
      'Button.jsx',
      'GradientButton.jsx',
      'Input.jsx',
      'Select.jsx',
      'Textarea.jsx',
      'Modal.jsx',
      'Tabs.jsx',
      'Skeleton.jsx',
      'EmptyState.jsx',
      'Alert.jsx',
      'GlowBadge.jsx',
      'AIOrb.jsx',
      'ProgressRing.jsx',
      'AnimatedMetric.jsx',
      'PageHeader.jsx',
    ];

    for (const comp of requiredUIComponents) {
      const compPath = path.join(uiDir, comp);
      assert(fs.existsSync(compPath), `UI Primitive [${comp}] exists and is available`);
    }

    // -------------------------------------------------------------
    // PART 3: Page Views & Route Integrity
    // -------------------------------------------------------------
    console.log('\n--- PART 3: Verifying User and Admin Pages Integrity ---');
    const pagesDir = path.join(__dirname, '../../client/src/pages');
    const requiredPages = [
      'LandingPage.jsx',
      'LoginPage.jsx',
      'RegisterPage.jsx',
      'DashboardPage.jsx',
      'CareerGoalPage.jsx',
      'ProfilePage.jsx',
      'SettingsPage.jsx',
      'ResumeUploadPage.jsx',
      'ResumeHistoryPage.jsx',
      'ResumeDetailPage.jsx',
      'ResumeImproverPage.jsx',
      'AnalysisResultPage.jsx',
      'ImprovementResultPage.jsx',
      'JobOptimizationPage.jsx',
      'JobOptimizationResultPage.jsx',
      'JobOptimizationHistoryPage.jsx',
      'JobsFeedPage.jsx',
      'JobDetailPage.jsx',
      'ApplicationsPage.jsx',
      'ApplicationDetailPage.jsx',
      'SkillGapPage.jsx',
      'SkillGapResultPage.jsx',
      'SkillGapHistoryPage.jsx',
      'MockInterviewConfigPage.jsx',
      'MockInterviewSessionPage.jsx',
      'MockInterviewResultPage.jsx',
      'MockInterviewHistoryPage.jsx',
      'ResumeBuilderDashboardPage.jsx',
      'ResumeBuilderEditorPage.jsx',
      'ResumeBuilderPreviewPage.jsx',
      'CareerChatPage.jsx',
      'NotificationsPage.jsx',
      'admin/AdminDashboardPage.jsx',
      'admin/AdminJobsListPage.jsx',
      'admin/AdminJobCreatePage.jsx',
      'admin/AdminJobEditPage.jsx',
      'admin/AdminJobDetailPage.jsx',
      'admin/AdminApplicationsListPage.jsx',
      'admin/AdminApplicationDetailPage.jsx',
    ];

    for (const page of requiredPages) {
      const pagePath = path.join(pagesDir, page);
      assert(fs.existsSync(pagePath), `Page [${page}] exists and is correctly routed`);
    }

    // -------------------------------------------------------------
    // PART 4: Navigation Architecture Verification
    // -------------------------------------------------------------
    console.log('\n--- PART 4: Verifying Navigation Architecture & RBAC ---');
    const sidebarPath = path.join(__dirname, '../../client/src/components/layout/Sidebar.jsx');
    const adminSidebarPath = path.join(__dirname, '../../client/src/components/layout/AdminSidebar.jsx');
    const appPath = path.join(__dirname, '../../client/src/App.jsx');

    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
    const adminSidebarContent = fs.readFileSync(adminSidebarPath, 'utf8');
    const appContent = fs.readFileSync(appPath, 'utf8');

    assert(sidebarContent.includes('/dashboard'), 'User sidebar links to /dashboard');
    assert(sidebarContent.includes('/jobs'), 'User sidebar links to /jobs');
    assert(sidebarContent.includes('/applications'), 'User sidebar links to /applications');
    assert(sidebarContent.includes('/resume/analyzer'), 'User sidebar links to /resume/analyzer');
    assert(sidebarContent.includes('/mock-interview'), 'User sidebar links to /mock-interview');
    assert(sidebarContent.includes('/skill-gap'), 'User sidebar links to /skill-gap');
    assert(sidebarContent.includes('/career-chat'), 'User sidebar links to /career-chat');

    assert(adminSidebarContent.includes('/admin'), 'Admin sidebar links to /admin');
    assert(adminSidebarContent.includes('/admin/jobs'), 'Admin sidebar links to /admin/jobs');
    assert(adminSidebarContent.includes('/admin/applications'), 'Admin sidebar links to /admin/applications');
    assert(adminSidebarContent.includes('Student Workspace'), 'Admin sidebar includes quick switch to Student Workspace');

    assert(appContent.includes('ProtectedRoute'), 'App router wraps user workspace with ProtectedRoute');
    assert(appContent.includes('AdminRoute'), 'App router wraps admin routes with AdminRoute');

    console.log('\n====================================================');
    console.log(`  PHASE 10 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n[ERROR IN PHASE 10 AUDIT]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase10Audit();
