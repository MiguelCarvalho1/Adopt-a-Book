const router = require('express').Router();
const TransactionController = require('../controller/TransactionController');
const verifyToken = require("../helpers/verify-token");

router.post('/', verifyToken, TransactionController.createTransaction);
router.get('/received', verifyToken, TransactionController.getReceivedTransactions);
router.get('/sent', verifyToken, TransactionController.getSentTransactions);
router.put('/:id', verifyToken, TransactionController.updateTransaction);
router.delete('/:id', verifyToken, TransactionController.deleteTransaction);

module.exports = router;
