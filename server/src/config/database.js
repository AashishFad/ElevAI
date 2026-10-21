require('./env');
const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

async function testDatabaseConnection() {
  try {
    const client = getPrismaClient();
    // Run a lightweight raw query to test PostgreSQL connection
    await client.$queryRaw`SELECT 1`;
    return { connected: true, message: 'Database connection successful' };
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    return { 
      connected: false, 
      message: isProd ? 'Database connection unavailable' : error.message 
    };
  }
}

module.exports = {
  getPrismaClient,
  testDatabaseConnection,
};
