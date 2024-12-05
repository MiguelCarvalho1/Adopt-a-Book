const express = require('express');
const router = express.Router();
const UserBadgeController = require('../controllers/UserBadgeController');
const { verifyToken } = require('../helpers/verify-token');

router.post('/', verifyToken, UserBadgeController.assignBadge); 
router.get('/:userId', UserBadgeController.getUserBadges); 
router.delete('/:id', verifyToken, UserBadgeController.removeBadge); 

module.exports = router;
