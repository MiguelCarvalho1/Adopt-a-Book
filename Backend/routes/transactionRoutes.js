const router = require('express').Router();
const TransactionController = require('../controller/TransactionController');
const verifyToken = require("../helpers/verify-token");

router.post('/', verifyToken, TransactionController.createTransaction);
router.post('/start', verifyToken, TransactionController.startTransaction); 
router.put('/:id/complete', verifyToken, TransactionController.completeTransaction); 
router.put('/:id/cancel', verifyToken, TransactionController.cancelTransaction); 
router.get('/', verifyToken, TransactionController.getAllTransactions); 
router.get('/sent', verifyToken, TransactionController.getSentTransactions);
router.get('/received', verifyToken, TransactionController.getReceivedTransactions);


module.exports = router;
