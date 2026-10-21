/**
 * ElevAI - Legacy Provider Compatibility Layer
 *
 * All AI execution is now centralized in `aiService.js` powered by local Ollama (Qwen 2.5 7B).
 * This module re-exports the centralized AI service.
 */
const aiService = require('./aiService');

module.exports = aiService;
