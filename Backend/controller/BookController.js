const Book = require('../models/Book')

// helpers
const getUserByToken = require('../helpers/get-user-by-token')
const getToken = require('../helpers/get-token')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class BookController {
  // create a book
  static async create(req, res) {
    const title = req.body.title
    const author = req.body.author
    const genre = req.body.genre
    const language = req.body.language
    const condition = req.body.condition
    const description = req.body.description
    const quantity = req.body.quantity
    const images = req.files
    const transactionType = req.body.transactionType
    const available = true

    // validations
    if (!title) {
      res.status(422).json({ message: 'The title is mandatory!' })
      return
    }

    if (!author) {
      res.status(422).json({ message: 'Author is mandatory!' })
      return
    }

    if (!condition) {
      res.status(422).json({ message: 'Condition is mandatory!' })
      return
    }

    if (!quantity) {
      res.status(422).json({ message: 'Quantity is mandatory!' })
      return
    }

    if (!images) {
      res.status(422).json({ message: 'The image is mandatory!' })
      return
    }

    // get user
    const token = getToken(req)
    const user = await getUserByToken(token)

    // create book
    const book = new Book({
      title: title,
      author: author,
      genre: genre,
      language: language,
      condition: condition,
      description: description,
      quantity: quantity,
      images: [],
      transactionType: transactionType,
      available: available,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    })

    images.map((image) => {
      book.images.push(image.filename)
    })

    try {
      const newBook = await book.save()

      res.status(201).json({
        message: 'Book successfully registered!',
        newBook: newBook,
      })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }

  // get all registered books
  static async getAll(req, res) {
    const books = await Book.find().sort('-createdAt')

    res.status(200).json({
      books: books,
    })
  }

  // get all user books
  static async getAllUserBooks(req, res) {
    // get user
    const token = getToken(req)
    const user = await getUserByToken(token)

    const books = await Book.find({ 'user._id': user._id })

    res.status(200).json({
      books,
    })
  }

  // get all user borrowed books
  static async getAllUserBorrowedBooks(req, res) {
    // get user
    const token = getToken(req)
    const user = await getUserByToken(token)

    const books = await Book.find({ 'borrower._id': user._id })

    res.status(200).json({
      books,
    })
  }

  // get a specific book
  static async getBookById(req, res) {
    const id = req.params.id

    // check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID!' })
      return
    }

    // check if book exists
    const book = await Book.findOne({ _id: id })

    if (!book) {
      res.status(404).json({ message: 'Book not found!' })
      return
    }

    res.status(200).json({
      book: book,
    })
  }

  // remove a book by id
  static async removeBookById(req, res) {
    const id = req.params.id

    try {
      // Verifica se o Book existe
      const book = await Book.findById(id)
      if (!book) {
        return res.status(404).json({ message: 'Book not found!' })
      }

      // Remove o Book
      await Book.findByIdAndDelete(id)

      return res.status(200).json({ message: 'Book removed successfully!' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'An error occurred while removing the book.' })
    }
  }

  // update a book
  static async updateBook(req, res) {
    const id = req.params.id
    const title = req.body.title
    const author = req.body.author
    const genre = req.body.genre
    const language = req.body.language
    const condition = req.body.condition
    const description = req.body.description
    const quantity = req.body.quantity
    const images = req.files
    const transactionType = req.body.transactionType
    const available = req.body.available

    const updateData = {}

    // check if book exists
    const book = await Book.findOne({ _id: id })

    if (!book) {
      res.status(404).json({ message: 'Book not found!' })
      return
    }

    // check if user registered this book
    const token = getToken(req)
    const user = await getUserByToken(token)

    if (book.user._id.toString() != user._id.toString()) {
      res.status(404).json({
        message:
          'There was a problem processing your request, please try again later!',
      })
      return
    }

    // validations
    if (!title) {
      res.status(422).json({ message: 'The title is mandatory!' })
      return
    } else {
      updateData.title = title
    }

    if (!author) {
      res.status(422).json({ message: 'Author is mandatory!' })
      return
    } else {
      updateData.author = author
    }

    if (!condition) {
      res.status(422).json({ message: 'Condition is mandatory!' })
      return
    } else {
      updateData.condition = condition
    }

    if (!quantity) {
      res.status(422).json({ message: 'Quantity is mandatory!' })
      return
    } else {
      updateData.quantity = quantity
    }

    if (!images) {
      res.status(422).json({ message: 'The image is mandatory!' })
      return
    } else {
      updateData.images = []
      images.map((image) => {
        updateData.images.push(image.filename)
      })
    }

    if (!transactionType) {
      res.status(422).json({ message: 'Transaction type is mandatory!' })
      return
    } else {
      updateData.transactionType = transactionType
    }

    if (available !== undefined) {
      updateData.available = available
    }

    updateData.description = description

    await Book.findByIdAndUpdate(id, updateData)

    res.status(200).json({ book: book, message: 'Book successfully updated!' })
  }

  // schedule a visit to borrow a book
  static async schedule(req, res) {
    const id = req.params.id

    // check if book exists
    const book = await Book.findOne({ _id: id })

    // check if user owns this book
    const token = getToken(req)
    const user = await getUserByToken(token)

    if (book.user._id.equals(user._id)) {
      res.status(422).json({
        message: "You can't borrow your own book!",
      })
      return
    }

    // check if user has already borrowed this book
    if (book.borrower) {
      if (book.borrower._id.equals(user._id)) {
        res.status(422).json({
          message: "You've already borrowed this book!",
        })
        return
      }
    }

    // add user to book's borrower
    book.borrower = {
      _id: user._id,
      name: user.name,
      image: user.image,
    }

    await Book.findByIdAndUpdate(book._id, book)

    res.status(200).json({
      message: `The visit has been successfully scheduled, please contact ${book.user.name} on the phone: ${book.user.phone}`,
    })
  }

  // conclude book adoption (borrowed)
  static async concludeBorrow(req, res) {
    const id = req.params.id

    // check if book exists
    const book = await Book.findOne({ _id: id })

    book.available = false

    await Book.findByIdAndUpdate(book._id, book)

    res.status(200).json({
      book: book,
      message: `Congratulations! The book borrowing has been successfully concluded!`,
    })
  }
}
