const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

class TransactionController {
  // Criar uma transação
  static async createTransaction(req, res) {
    const { bookId, senderId, transactionType } = req.body;

    try {
      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Garantir que o livro esteja disponível para transação
      if (book.available === false) {
        return res.status(400).json({ message: 'Book is no longer available for transaction' });
      }

      // Criar a transação
      const transaction = new Transaction({
        bookId: book._id,
        senderId: senderId, // O usuário que está oferecendo o livro
        receiverId: null,    // Inicialmente sem receptor
        pointsExchanged: 0,  // Pode ser ajustado conforme a lógica de transação
        status: 'Pending',   // Status inicial da transação
        transactionType: transactionType, // Tipo de transação (venda, troca, doação)
      });

      // Salvar a transação
      await transaction.save();

      // Adicionar a transação ao livro
      book.transactions.push(transaction._id);
      await book.save();

      res.status(201).json({
        message: 'Transaction created successfully!',
        transaction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating transaction', error });
    }
  }

  // Iniciar uma transação (quando o receptor é definido)
  static async startTransaction(req, res) {
    const { bookId, receiverId } = req.body;

    try {
      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      if (transaction.senderId.toString() === receiverId.toString()) {
        return res.status(400).json({ message: 'User cannot transact with themselves' });
      }

      // Buscar a transação associada ao livro
      const transaction = await Transaction.findOne({ bookId: bookId, status: 'Pending' });

      if (!transaction) {
        return res.status(404).json({ message: 'Pending transaction not found' });
      }

      // Definir o receptor e mudar o status para "In Progress"
      transaction.receiverId = receiverId;
      transaction.status = 'In Progress';

      await transaction.save();

      res.status(200).json({
        message: 'Transaction started successfully!',
        transaction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error starting transaction', error });
    }
  }

  // Concluir a transação (após as etapas de troca, venda ou doação)
  static async completeTransaction(req, res) {
    const { bookId } = req.params;

    try {
      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Verificar se a transação está em andamento
      const transaction = await Transaction.findOne({ bookId: bookId, status: 'In Progress' });

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not in progress' });
      }

      // Marcar a transação como "Completed"
      transaction.status = 'Completed';
      await transaction.save();

      // Atualizar o livro (marcar como não disponível)
      book.available = false; // O livro não estará mais disponível para transações
      await book.save();

      res.status(200).json({
        message: 'Transaction completed successfully!',
        transaction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error completing transaction', error });
    }
  }

  // Cancelar uma transação (se necessário)
  static async cancelTransaction(req, res) {
    const { bookId } = req.params;

    try {
      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      const transaction = await Transaction.findOne({ bookId: bookId, status: 'Pending' });

      if (!transaction) {
        return res.status(404).json({ message: 'Pending transaction not found' });
      }

      // Cancelar a transação
      transaction.status = 'Canceled';
      await transaction.save();

      res.status(200).json({
        message: 'Transaction canceled successfully!',
        transaction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error canceling transaction', error });
    }
  }

  // Obter todas as transações (para visualização)
  static async getAllTransactions(req, res) {
    try {
      const transactions = await Transaction.find().populate('bookId').populate('senderId').populate('receiverId').sort('-createdAt');

      res.status(200).json({
        transactions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching transactions', error });
    }
  }
}

module.exports = TransactionController;
