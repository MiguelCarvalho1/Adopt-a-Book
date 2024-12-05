const router = require('express').Router();
const TransactionController = require('../controller/TransactionController');
const  verifyToken  = require("../helpers/verify-token");

router.post('/', verifyToken, TransactionController.createTransaction); 
router.get('/', verifyToken, TransactionController.getAllTransactions); 
router.get('/:id', verifyToken, TransactionController.getTransactionById); 
router.put('/:id', verifyToken, TransactionController.updateTransaction); 
router.delete('/:id', verifyToken, TransactionController.deleteTransaction); 

module.exports = router;
