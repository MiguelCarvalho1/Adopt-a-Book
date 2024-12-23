const router = require('express').Router();
const TransactionController = require('../controller/TransactionController');
const verifyToken = require("../helpers/verify-token");

router.post('/', verifyToken, TransactionController.createTransaction);
router.post('/start', verifyToken, TransactionController.startTransaction);

router.patch('/:transactionId/accept', verifyToken, TransactionController.acceptTransaction);


router.patch('/:transactionId/reject', verifyToken, TransactionController.rejectTransaction);  
router.get('/mytransaction', verifyToken, TransactionController.getUserTransactions); 
router.get('/sent', verifyToken, TransactionController.getSentTransactions);
router.get('/received', verifyToken, TransactionController.getReceivedTransactions);


module.exports = router;
