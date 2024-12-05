const router = require('express').Router();
const UserBadgeController = require('../controller/UserBadgeController');
const  verifyToken  = require("../helpers/verify-token");

router.post('/', verifyToken, UserBadgeController.assignBadge); 
router.get('/:id', UserBadgeController.getUserBadges);
router.delete('/:id', verifyToken, UserBadgeController.removeBadge); 

module.exports = router;
