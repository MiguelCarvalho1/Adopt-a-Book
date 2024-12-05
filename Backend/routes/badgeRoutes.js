const express = require('express');
const router = express.Router();
const BadgeController = require('../controllers/BadgeController');
const { verifyToken } = require('../helpers/verify-token');

router.post('/', verifyToken, BadgeController.createBadge);
router.get('/', BadgeController.getAllBadges);
router.put('/:id', verifyToken, BadgeController.updateBadge); 
router.delete('/:id', verifyToken, BadgeController.deleteBadge); 

module.exports = router;
