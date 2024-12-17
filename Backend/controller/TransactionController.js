const Transaction = require('../models/Transaction');
const getUserByToken = require('../helpers/get-user-by-token');
const getToken = require('../helpers/get-token');
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
    const { bookId } = req.body;
  
    try {

      const token = getToken(req);
      const user = await getUserByToken(token);
      const book = await Book.findById(bookId);
      if (!user) {
        return res.status(404).json({ message: 'User not found or invalid token.' });
      }
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found.' });
      }
  
      // Evita que o usuário se transacione com ele mesmo
      if (user._id.toString() === book.user.toString()) {  // Aqui, você pode comparar com o dono do livro
        return res.status(400).json({ message: 'User cannot transact with themselves' });
      }
  
      // Busca a transação associada ao livro com status 'Pending'
      const transaction = await Transaction.findOne({ bookId: bookId, status: 'Pending' });
  
      if (!transaction) {
        return res.status(404).json({ message: 'Pending transaction not found' });
      }
  
      // Define o receiverId e altera o status da transação para 'In Progress'
      transaction.receiverId = user._id;  // O backend pega o receiverId do usuário autenticado
      transaction.status = 'In Progress';
  
      await transaction.save();
  
      res.status(200).json({
        message: 'Transaction started successfully!',
        transaction,
      });
    } catch (error) {
      console.error('Error starting transaction:', error);
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
  // Get all transactions (sent or received based on query parameter)
static async getAllTransactions(req, res) {
  const { type } = req.query;  // 'sent' or 'received'

  try {
    let filter = {};
    
    // If the type is 'sent', filter by senderId
    if (type === 'sent') {
      filter.senderId = req.user._id;
    }
    // If the type is 'received', filter by receiverId
    else if (type === 'received') {
      filter.receiverId = req.user._id;
    }

    const transactions = await Transaction.find(filter)
      .populate('bookId')
      .populate('senderId')
      .populate('receiverId')
      .sort('-createdAt');  // Sort by createdAt in descending order

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
}

// Get received transactions
static async getReceivedTransactions(req, res) {
  try {
    // Filter transactions where the receiverId matches the current user's ID
    const receivedTransactions = await Transaction.find({ receiverId: req.user._id })
      .populate('bookId')
      .populate('senderId')
      .populate('receiverId')
      .sort('-createdAt');  // Sort by date descending

    if (receivedTransactions.length === 0) {
      return res.status(404).json({ message: 'No received transactions found' });
    }

    res.status(200).json({ transactions: receivedTransactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching received transactions', error });
  }
}

// Get sent transactions
static async getSentTransactions(req, res) {
  try {
    // Filter transactions where the senderId matches the current user's ID
    const sentTransactions = await Transaction.find({ senderId: req.user._id })
      .populate('bookId')
      .populate('senderId')
      .populate('receiverId')
      .sort('-createdAt');  // Sort by date descending

    if (sentTransactions.length === 0) {
      return res.status(404).json({ message: 'No sent transactions found' });
    }

    res.status(200).json({ transactions: sentTransactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching sent transactions', error });
  }
}

static async acceptTransaction(req, res) {
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

    // Alterar o status da transação para "Accepted"
    transaction.status = 'Accepted';
    await transaction.save();

    res.status(200).json({
      message: 'Transaction accepted successfully!',
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error accepting transaction', error });
  }
}
static async rejectTransaction(req, res) {
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

    // Alterar o status da transação para "Rejected"
    transaction.status = 'Rejected';
    await transaction.save();

    res.status(200).json({
      message: 'Transaction rejected successfully!',
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error rejecting transaction', error });
  }
}


}

module.exports = TransactionController;
