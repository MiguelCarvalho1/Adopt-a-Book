const Book = require('../models/Book');
const Transaction = require('../models/Transaction');  
const getUserByToken = require('../helpers/get-user-by-token');
const getToken = require('../helpers/get-token');
const { ObjectId } = require('mongodb');
const BookService = require('../service/BookService');



module.exports = class BookController {

  static async getBooksByGenre(req, res) {
    const { genre } = req.params;  // Obter o gênero a partir dos parâmetros da URL
    try {
      const books = await BookService.getBooksByGenre(genre);
      res.json(books);
    } catch (error) {
      console.error('Error when searching for books by genre:', error.message);
      res.status(500).json({ message: 'Error when searching for books by genre' });
    }
  }

  // Função para retornar os top livros de um gênero
  static async getTopBooksByGenre(req, res) {
    const { genre } = req.params;  // Obter o gênero a partir dos parâmetros da URL
    try {
      const books = await BookService.getTopBooksByGenre(genre);
      res.json(books);
    } catch (error) {
      console.error('Error when searching for books by genre:', error.message);
      res.status(500).json({ message: 'Error when searching for books by genre' });
    }
  }
  // create a book
// Método para criar um livro e uma transação associada
static async create(req, res) {
  const { title, author, genre, language, condition, description, transactionType } = req.body;
  const images = req.files;
  const available = true; // O livro estará disponível para transações inicialmente

  // Validações
  if (!title) {
      return res.status(422).json({ message: 'The title is mandatory!' });
  }

  if (!author) {
      return res.status(422).json({ message: 'Author is mandatory!' });
  }

  if (!condition) {
      return res.status(422).json({ message: 'Condition is mandatory!' });
  }

  if (!images || images.length === 0) {
      return res.status(422).json({ message: 'At least one image is mandatory!' });
  }

  try {
      // Obter o usuário a partir do token
      const token = getToken(req);
      const user = await getUserByToken(token);

      // Criar um novo livro
      const book = new Book({
          title,
          author,
          genre,
          language,
          condition,
          description,
          transactionType,
          available,
          images: [], // Inicializa a lista de imagens vazia
          user: user._id,  // Referência apenas o ObjectId do usuário
      });

      // Adicionar as imagens ao livro
      images.forEach((image) => {
          book.images.push(image.filename);
      });

      // Salvar o livro no banco de dados
      const newBook = await book.save();

      const transaction = new Transaction({
        bookId: newBook._id,
        senderId: user._id,
        receiverId: null, // Inicialmente sem receptor
        pointsExchanged: 0,
        status: 'Pending', // Transação pendente
        transactionType,
    });
      await transaction.save();

      // Adicionar a transação ao livro
      newBook.transactions.push(transaction._id);
      await newBook.save();

      // Retornar resposta de sucesso com o livro e a transação criada
      res.status(201).json({
          message: 'Book successfully registered and transaction created!',
          newBook,
          transaction,
      });
  } catch (error) {
      // Erro ao salvar o livro ou criar a transação
      console.error(error);
      res.status(500).json({ message: 'Error registering book and creating transaction.', error });
  }
}


  // Método para pegar todos os livros registrados
  static async getAll(req, res) {
    const books = await Book.find().sort('-createdAt');
    res.status(200).json({ books });
  }

  // get all user books
  static async getAllUserBooks(req, res) {
    try {
        const token = getToken(req);
        const user = await getUserByToken(token);

        // Busca os livros do usuário e popula as transações relacionadas
        const books = await Book.find({ user: user._id })
            .populate({
                path: 'transactions', // Nome do campo no schema do Book
                select: 'status', // Opcional: seleciona apenas o campo 'status' da transação
            })
            .exec();

        // Adiciona o status da transação diretamente ao JSON de retorno
        const booksWithTransactionStatus = books.map((book) => ({
            ...book.toObject(),
            transactionStatus: book.transactions.length
                ? book.transactions[0].status // Exibe o status da primeira transação (ou ajuste conforme necessário)
                : null, // Caso não haja transações
        }));

        res.status(200).json({
            books: booksWithTransactionStatus,
        });
    } catch (error) {
        console.error('Error fetching user books:', error);
        res.status(500).json({
            message: 'An error occurred while fetching user books.',
        });
    }
}


  // get all user borrowed books
  static async getAllUserBorrowedBooks(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const books = await Book.find({ 'borrower._id': user._id });

    res.status(200).json({
      books,
    });
  }

  // get a specific book
  static async getBookById(req, res) {
    const id = req.params.id;

    // check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID!' });
      return;
    }

    // check if book exists
    const book = await Book.findOne({ _id: id });

    if (!book) {
      res.status(404).json({ message: 'Book not found!' });
      return;
    }

    res.status(200).json({
      book: book,
    });
  }

  // remove a book by id
  static async removeBookById(req, res) {
    const id = req.params.id;

    try {
      // Verifica se o Book existe
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found!' });
      }

      // Remove o Book
      await Book.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Book removed successfully!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while removing the book.' });
    }
  }

  // update a book
  static async updateBook(req, res) {
    const id = req.params.id;
    const { title, author, genre, language, condition, description, quantity, transactionType, available } = req.body;
    const images = req.files;

    const updateData = {};

    // check if book exists
    const book = await Book.findOne({ _id: id });

    if (!book) {
      res.status(404).json({ message: 'Book not found!' });
      return;
    }

    // check if user registered this book
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (book.user.toString() !== user._id.toString()) {
      res.status(404).json({
        message: 'You are not authorized to update this book.',
      });
      return;
    }

    // validations and updates
    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (condition) updateData.condition = condition;
    if (quantity) updateData.quantity = quantity;
    if (images && images.length > 0) updateData.images = images.map(image => image.filename);
    if (transactionType) updateData.transactionType = transactionType;
    if (available !== undefined) updateData.available = available;
    if (description) updateData.description = description;

    await Book.findByIdAndUpdate(id, updateData);

    res.status(200).json({ book, message: 'Book successfully updated!' });
  }

  // schedule a visit to borrow a book
  static async schedule(req, res) {
    const id = req.params.id;

    // check if book exists
    const book = await Book.findOne({ _id: id });

    // check if user owns this book
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (book.user._id.equals(user._id)) {
      res.status(422).json({
        message: "You can't borrow your own book!",
      });
      return;
    }

    // check if user has already borrowed this book
    if (book.borrower && book.borrower._id.equals(user._id)) {
      res.status(422).json({
        message: "You've already borrowed this book!",
      });
      return;
    }

    // add user to book's borrower
    book.borrower = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Book.findByIdAndUpdate(book._id, book);

    res.status(200).json({
      message: `The visit has been successfully scheduled, please contact ${book.user.name} on the phone: ${book.user.phone}`,
    });
  }

  // conclude book adoption (borrowed)
  static async concludeBorrow(req, res) {
    const id = req.params.id;

    // check if book exists
    const book = await Book.findOne({ _id: id });

    if (!book) {
      res.status(404).json({ message: 'Book not found!' });
      return;
    }

    // mark the book as unavailable
    book.available = false;

    await Book.findByIdAndUpdate(book._id, book);

    res.status(200).json({
      book: book,
      message: `Congratulations! The book borrowing has been successfully concluded!`,
    });
  }
};
