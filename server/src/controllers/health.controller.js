const { testDatabaseConnection } = require('../config/database');
const env = require('../config/env');
const { checkOllamaHealth } = require('../ai/aiService');

async function getHealth(req, res, next) {
  try {
    const dbStatus = await testDatabaseConnection();
    const ollamaStatus = await checkOllamaHealth();

    res.status(200).json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
      services: {
        api: 'healthy',
        database: dbStatus.connected ? 'connected' : `disconnected (${dbStatus.message})`,
        ai: ollamaStatus.available ? 'healthy' : `unavailable (${ollamaStatus.error || 'unreachable'})`,
      },
      config: {
        aiProvider: 'ollama',
        aiModel: env.ollamaModel,
        aiBaseUrl: env.ollamaBaseUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check Ollama AI availability — determines if Ollama is running and qwen2.5:7b is loaded
 * Returns aiStatus: 'live' | 'unavailable'
 */
async function getAIStatus(req, res) {
  try {
    const health = await checkOllamaHealth();
    const hasModel = Boolean(health.hasModel || health.modelFound);

    if (health.available && hasModel) {
      return res.status(200).json({
        success: true,
        aiStatus: 'live',
        provider: 'ollama',
        model: health.model,
        message: `Local Ollama AI (${health.model}) is active and responding normally.`,
      });
    }

    if (health.available && !hasModel) {
      return res.status(200).json({
        success: false,
        aiStatus: 'unavailable',
        provider: 'ollama',
        model: health.model,
        message: `Ollama is running, but model "${health.model}" is not installed. Run: "ollama pull ${health.model}".`,
        availableModels: health.availableModels || health.allModels || [],
      });
    }

    return res.status(200).json({
      success: false,
      aiStatus: 'unavailable',
      provider: 'ollama',
      model: env.ollamaModel,
      message: 'Local Ollama AI service is unreachable. Please start Ollama with "ollama serve".',
      error: health.error,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      aiStatus: 'unavailable',
      provider: 'ollama',
      model: env.ollamaModel,
      message: 'Local AI service check encountered an unexpected error.',
    });
  }
}

module.exports = {
  getHealth,
  getAIStatus,
};
