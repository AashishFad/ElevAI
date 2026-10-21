const app = require('./app');
const env = require('./config/env');

const PORT = env.port;

const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 ElevAI Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.nodeEnv}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
