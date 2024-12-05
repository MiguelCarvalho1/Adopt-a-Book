const Transaction = require('../models/Transaction');
const { getUserByToken } = require('../helpers/get-user-by-token');

module.exports = class TransactionController {
    static async createTransaction(req, res) {
        const { bookId, transactionType, recipientId } = req.body;

        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            const user = await getUserByToken(token);

            const transaction = new Transaction({
                bookId,
                transactionType,
                senderId: user._id,
                recipientId,
                status: 'pending',
            });

            await transaction.save();
            res.status(201).json({ message: 'Transaction created successfully.', transaction });
        } catch (error) {
            res.status(500).json({ message: 'Error creating transaction.', error });
        }
    }

    static async getAllTransactions(req, res) {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            const user = await getUserByToken(token);

            const transactions = await Transaction.find({
                $or: [{ senderId: user._id }, { recipientId: user._id }],
            }).populate('bookId recipientId senderId');
            res.status(200).json(transactions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching transactions.', error });
        }
    }

    static async getTransactionById(req, res) {
        const { id } = req.params;

        try {
            const transaction = await Transaction.findById(id).populate('bookId recipientId senderId');
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }
            res.status(200).json(transaction);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching transaction.', error });
        }
    }

    static async updateTransaction(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const transaction = await Transaction.findById(id);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }

            transaction.status = status || transaction.status;
            await transaction.save();
            res.status(200).json({ message: 'Transaction updated successfully.', transaction });
        } catch (error) {
            res.status(500).json({ message: 'Error updating transaction.', error });
        }
    }

    static async deleteTransaction(req, res) {
        const { id } = req.params;

        try {
            const transaction = await Transaction.findByIdAndDelete(id);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }
            res.status(200).json({ message: 'Transaction deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting transaction.', error });
        }
    }
};
