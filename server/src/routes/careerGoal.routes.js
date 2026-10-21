const express = require('express');
const {
  getCareerGoal,
  createCareerGoal,
  updateCareerGoal,
  deleteCareerGoal,
} = require('../controllers/careerGoal.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Require authentication for all career goal endpoints
router.use(authMiddleware);

router.get('/', getCareerGoal);
router.post('/', createCareerGoal);
router.put('/', updateCareerGoal);
router.delete('/', deleteCareerGoal);

module.exports = router;
