/**
 * Safe Admin Promotion CLI Script for ElevAI Development
 * Usage: node scripts/makeAdmin.js <email> [role: ADMIN|USER]
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const targetRole = (process.argv[3] || 'ADMIN').toUpperCase();

  if (!email) {
    console.error('❌ Error: Email address required.');
    console.log('Usage: node scripts/makeAdmin.js <email> [ADMIN|USER]');
    process.exit(1);
  }

  if (!['ADMIN', 'USER'].includes(targetRole)) {
    console.error('❌ Error: Target role must be either ADMIN or USER');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: targetRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    console.log(`✅ Success! User "${updated.name}" (${updated.email}) role updated to: ${updated.role}`);
  } catch (error) {
    console.error('❌ Failed to update user role:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
