const Transaction = require('../models/Transaction');
const getUserByToken = require('../helpers/get-user-by-token');
const getToken = require('../helpers/get-token');
const Book = require('../models/Book');
const EventEmitter = require('events');
const transactionEmitter = new EventEmitter();

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
  

  
  static async acceptTransaction(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const { bookId } = req.body;  // Recebe o bookId no corpo da requisição
  
    try {
      console.log('User attempting to accept transaction:', user);
      console.log('Book ID received:', bookId);
  
      // Procurar pelo livro com o bookId fornecido
      const book = await Book.findById(bookId);
      if (!book) {
        console.log('Book not found.');
        return res.status(404).json({ message: 'Book not found' });
      }
  
      console.log('Book found:', book); // Verifica se o livro foi encontrado
  
      // Procurar pela transação que está associada ao livro
      const transaction = await Transaction.findOne({ bookId: bookId }).populate('bookId');
      if (!transaction) {
        console.log('Transaction not found for this book.');
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      console.log('Transaction found:', transaction);
  
      // Verifica se a transação está em andamento
      if (transaction.status !== 'In Progress') {
        console.log('Transaction is not pending.');
        return res.status(400).json({ message: 'Transaction is not pending, cannot accept' });
      }
  
      // Atualiza o status da transação para "Accepted"
      transaction.status = 'Accepted';
      await transaction.save();
  
      // Atualiza o dono do livro para o usuário logado
      book.owner = user._id;
      await book.save();
  
      await this.completeTransaction({
        body: {
          bookId: transaction.bookId._id,
          receiverId: transaction.receiverId 
        }
      }, res);
    } catch (error) {
      console.error('Error during transaction acceptance:', error);
      res.status(500).json({ message: 'Error accepting transaction', error });
    }
  }

  // Completar a transação e atualizar o status do livro automaticamente
  static async completeTransaction(req, res) {
    try {
      // Obter ID da transação a partir dos parâmetros da requisição
      const { transactionId } = req.params;
  
      // Buscar a transação no banco de dados
      const transaction = await Transaction.findById(transactionId)
        .populate('bookId', 'title ownerId') // Popula informações do livro
        .populate('receiverId', 'name email') // Popula informações do receptor
        .populate('senderId', 'name email'); // Popula informações do remetente
  
      // Verificar se a transação existe
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Verificar o status da transação
      if (transaction.status === 'completed') {
        return res.status(400).json({ message: 'Transaction is already completed' });
      }
  
      // Marcar a transação como concluída
      transaction.status = 'Completed';
      transaction.completedAt = new Date(); // Registra a data de conclusão
      await transaction.save();
  
      // Atualizar o status do livro (se aplicável)
      if (transaction.bookId) {
        const book = await Book.findById(transaction.bookId);
        if (book) {
          book.status = 'Completed'; // Marca o livro como não disponível
          await book.save();
        }
      }
  
      // Sistema de pontos (se aplicável)
      if (transaction.receiverId) {
        const receiver = await User.findById(transaction.receiverId._id);
        if (receiver) {
          receiver.points = (receiver.points || 0) + transaction.points; // Adiciona os pontos da transação
          await receiver.save();
        }
      }
  
      // Enviar notificação de conclusão (exemplo)
      await sendNotification(transaction.senderId, {
        title: 'Transaction Completed',
        message: `The transaction for the book "${transaction.bookId.title}" has been successfully completed.`
      });
  
      await sendNotification(transaction.receiverId, {
        title: 'Transaction Completed',
        message: `You have successfully completed the transaction for the book "${transaction.bookId.title}".`
      });
  
      // Resposta de sucesso
      return res.status(200).json({
        message: 'Transaction successfully completed',
        transaction
      });
    } catch (error) {
      console.error('Error completing transaction:', error);
      return res.status(500).json({ message: 'Error completing transaction', error });
    }
  }
  
  

  // Cancelar uma transação (se necessário)
  static async rejectTransaction(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const { bookId } = req.body;  // Recebe o bookId no corpo da requisição

    try {
        console.log('User attempting to reject transaction:', user);
        console.log('Book ID received:', bookId);

        // Procurar pelo livro com o bookId fornecido
        const book = await Book.findById(bookId);
        if (!book) {
            console.log('Book not found.');
            return res.status(404).json({ message: 'Book not found' });
        }

        console.log('Book found:', book);

        // Procurar pela transação que está associada ao livro
        const transaction = await Transaction.findOne({ bookId: bookId }).populate('bookId');
        if (!transaction) {
            console.log('Transaction not found for this book.');
            return res.status(404).json({ message: 'Transaction not found' });
        }

        console.log('Transaction found:', transaction);

        // Verifica se a transação está em andamento
        if (transaction.status !== 'In Progress') {
            console.log('Transaction is not in progress.');
            return res.status(400).json({ message: 'Transaction is not in progress, cannot reject' });
        }

        // Verifica se o usuário é o receptor ou remetente da transação
        if (transaction.senderId.toString() !== user._id.toString() && transaction.receiverId.toString() !== user._id.toString()) {
            console.log('User is not part of this transaction.');
            return res.status(403).json({ message: 'User is not part of this transaction' });
        }

        // Atualiza o status da transação para "Rejected"
        transaction.status = 'Rejected';
        await transaction.save();

        // Opcionalmente, podemos atualizar o status do livro para refletir que ele está novamente disponível
        book.available = true; // Se o livro não foi transferido ainda
        await book.save();

        res.status(200).json({
            message: 'Transaction rejected successfully!',
            transaction,
            bookId: book._id, // Retorna o ID do livro
        });
    } catch (error) {
        console.error('Error during transaction rejection:', error);
        res.status(500).json({ message: 'Error rejecting transaction', error });
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
    const token = getToken(req);
    // Obter usuário logado pelo token
    const user = await getUserByToken(token);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }

    const userId = user._id;

    // Buscar transações onde o userId é sender ou receiver
    const receivedTransactions = await Transaction.find({
      $or: [{ senderId: userId }],
    })
      .populate('bookId', 'title transactionType')
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
    const token = getToken(req);
    // Obter usuário logado pelo token
    const user = await getUserByToken(token);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }

    const userId = user._id;

    // Buscar transações onde o userId é sender ou receiver
    const sentTransactions = await Transaction.find({
      $or: [ { receiverId: userId }],
    })
      .populate('bookId', 'title transactionType')
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
  const transactionId = req.params.transactionId;
  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'In Progress') {
      return res.status(400).json({ message: 'Transaction is not in progress' });
    }

    transaction.status = 'Accepted';
    await transaction.save();

    // Emitir evento para automação
    transactionEmitter.emit('transactionAccepted', transaction);

    return res.status(200).json({ message: 'Transaction accepted', transaction });
  } catch (err) {
    console.error('Error accepting transaction:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
static async completeTransaction(req, res) {
  const { bookId, receiverId } = req.body;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Verificar se há uma transação aceita para este livro
    const transaction = await Transaction.findOne({ bookId, status: 'Accepted' });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not in accepted status' });
    }

    // Atualizar o status da transação e o proprietário do livro
    transaction.status = 'Completed';
    await transaction.save();

    book.available = false;
    book.owner = receiverId;
    await book.save();

    res.status(200).json({
      message: 'Transaction completed and book ownership updated successfully!',
      transaction,
      book,
    });
  } catch (error) {
    console.error('Error completing transaction:', error);
    res.status(500).json({ message: 'Error completing transaction', error });
  }
}


static async rejectTransaction(req, res) {
  const transactionId = req.params.transactionId;
  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'In Progress') {
      return res.status(400).json({ message: 'Transaction is not in progress' });
    }

    transaction.status = 'Rejected';
    await transaction.save();

    return res.status(200).json({ message: 'Transaction rejected', transaction });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}



static async getUserTransactions(req, res) {
  try {
   
    const token = getToken(req);
    // Obter usuário logado pelo token
    const user = await getUserByToken(token);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }

    const userId = user._id;

    // Buscar transações onde o userId é sender ou receiver
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('bookId', 'title transactionType') // Inclui o título e o tipo do livro
      .populate('senderId', 'name') // Inclui o nome do sender
      .populate('receiverId', 'name') // Inclui o nome do receiver
      .sort('-createdAt') // Ordenar por data de criação
      .exec();

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this user.' });
    }

    // Retorna as transações encontradas
    res.status(200).json({ transactions });
  } catch (err) {
    console.error('Error fetching user transactions:', err);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
}




}

module.exports = TransactionController;

transactionEmitter.on('transactionAccepted', async (transaction) => {
  try {
    const book = await Book.findById(transaction.bookId);

    if (!book) {
      console.error(`Book not found for transaction ${transaction._id}`);
      return;
    }

    // Atualizar o livro e transação
    book.available = false;
    book.owner = transaction.receiverId;
    await book.save();

    transaction.status = 'Completed';
    await transaction.save();

    console.log(`Transaction ${transaction._id} completed and book ownership updated.`);
  } catch (error) {
    console.error('Error in transactionAccepted event:', error);
  }
});
