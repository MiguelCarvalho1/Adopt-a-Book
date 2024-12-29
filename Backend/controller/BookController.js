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

 
  static async getTopBooksByGenre(req, res) {
    const { genre } = req.params;  
    try {
      const books = await BookService.getTopBooksByGenre(genre);
      res.json(books);
    } catch (error) {
      console.error('Error when searching for books by genre:', error.message);
      res.status(500).json({ message: 'Error when searching for books by genre' });
    }
  }
 
static async create(req, res) {
  const { title, author, genre, language, condition, description, transactionType } = req.body;
  const images = req.files;
  const available = true; 
 
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
      
      const token = getToken(req);
      const user = await getUserByToken(token);
      const book = new Book({
          title,
          author,
          genre,
          language,
          condition,
          description,
          transactionType,
          available,
          images: [],
          user: user._id,  
      });

     
      images.forEach((image) => {
          book.images.push(image.filename);
      });

     
      const newBook = await book.save();

      const transaction = new Transaction({
        bookId: newBook._id,
        senderId: user._id,
        receiverId: null, 
        pointsExchanged: 0,
        status: 'Pending',
        transactionType,
    });
      await transaction.save();

      
      newBook.transactions.push(transaction._id);
      await newBook.save();

   
      res.status(201).json({
          message: 'Book successfully registered and transaction created!',
          newBook,
          transaction,
      });
  } catch (error) {
     
      console.error(error);
      res.status(500).json({ message: 'Error registering book and creating transaction.', error });
  }
}



  static async getAll(req, res) {
    const books = await Book.find().sort('-createdAt');
    res.status(200).json({ books });
  }

  
  static async getAllUserBooks(req, res) {
    try {
        const token = getToken(req);
        const user = await getUserByToken(token);

       
        const books = await Book.find({ user: user._id })
            .populate({
                path: 'transactions', 
                select: 'status', 
            })
            .exec();

        
        const booksWithTransactionStatus = books.map((book) => ({
            ...book.toObject(),
            transactionStatus: book.transactions.length
                ? book.transactions[0].status 
                : null, 
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


  
  static async getAllUserBorrowedBooks(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const books = await Book.find({ 'borrower._id': user._id });

    res.status(200).json({
      books,
    });
  }

  
  static async getBookById(req, res) {
    const id = req.params.id;

    
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID!' });
      return;
    }

   
    const book = await Book.findOne({ _id: id });

    if (!book) {
      res.status(404).json({ message: 'Book not found!' });
      return;
    }

    res.status(200).json({
      book: book,
    });
  }


  static async removeBookById(req, res) {
    const id = req.params.id;

    try {
    
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found!' });
      }

     
      await Book.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Book removed successfully!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while removing the book.' });
    }
  }


  static async updateBook(req, res) {
    const id = req.params.id;
    const { title, author, genre, language, condition, description, quantity, transactionType, available } = req.body;
    const images = req.files;

    const updateData = {};

   
    const book = await Book.findOne({ _id: id });

    if (!book) {
      res.status(404).json({ message: 'Book not found!' });
      return;
    }

   
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (book.user.toString() !== user._id.toString()) {
      res.status(404).json({
        message: 'You are not authorized to update this book.',
      });
      return;
    }

   
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


  static async schedule(req, res) {
    const id = req.params.id;


    const book = await Book.findOne({ _id: id });

    
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (book.user._id.equals(user._id)) {
      res.status(422).json({
        message: "You can't borrow your own book!",
      });
      return;
    }


    if (book.borrower && book.borrower._id.equals(user._id)) {
      res.status(422).json({
        message: "You've already borrowed this book!",
      });
      return;
    }

  
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

  static async concludeBorrow(req, res) {
    const id = req.params.id;

 
    const book = await Book.findOne({ _id: id });

    if (!book) {
      res.status(404).json({ message: 'Book not found!' });
      return;
    }

 
    book.available = false;

    await Book.findByIdAndUpdate(book._id, book);

    res.status(200).json({
      book: book,
      message: `Congratulations! The book borrowing has been successfully concluded!`,
    });
  }
};
