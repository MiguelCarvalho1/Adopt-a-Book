const createUserToken = require("../helpers/create-user-token");
const getUserByToken = require("../helpers/get-user-by-token");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/get-token");
const bcrypt = require("bcrypt");

const Book = require("../models/Book");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class BookController {
  static async addBook(req, res) {
    try {
      const {
        title,
        author,
        genre,
        language,
        condition,
        description,
        quantity,
        transactionType,
      } = req.body;

      const available = true;
      const images = req.files;

      // upload de images

      //validation
      if (
        !title ||
        !author ||
        !genre ||
        !language ||
        !condition ||
        !description ||
        !quantity ||
        !transactionType ||
        images.length === 0
      ) {
        return res.status(400).json({ message: "Please fill all the fields" });
      }
      const token = getToken(req);
      const user = await getUserByToken(token);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Create book

      const book = new Book({
        title,
        author,
        genre,
        language,
        condition,
        quantity,
        description,
        transactionType,
        available,
        images: [],
        user: {
          _id: user._id,
          name: user.name,
          image: user.image,
          phone: user.phone,
        },
      });

      images.map((image) => {
        pet.images.push(image.filename);
      });

      const newBook = await book.save();
      res.status(201).json({ message: "Book added successfully.", newBook });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error." });
    }
  }

  static async getBooks(req, res) {
    try {
      const books = await Book.find().sort("-createAt");
      res.status(200).json({ books });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  }

  //get mey books
  static async getMyBooks(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    try {
      const books = await Book.find({ "user._id": user._id }).sort("-createAt");
      res.status(200).json({ books });
    } catch (err) {
      return res.status(400).json({ message: "Error getting pets" });
    }
  }

  //get books by id
  static async getBookById(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID is invalidate" });
    }
    try {
      const book = await Book.findOne({ _id: id });

      if (!book) {
        return res.status(404).json({ message: "Book not found." });
      }

      res.status(200).json({ book });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  }

  //remove book
  static async removeBook(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID is invalidate" });
    }

    const token = getToken(req);
    const user = await getUserByToken(token);
    if (book.user._id.toString() !== book._id.toString()) {
      return res
        .status(422)
        .json({ message: "You are not the owner of this book" });
    }
    try {
      await Book.findByIdAndDelete(id);
      res.status(200).json({ message: "Book deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  }

  //update books
  static async updateBook(req, res) {
    const id = req.params.id;
    const {
        title,
        author,
        genre,
        language,
        condition,
        description,
        quantity,
        transactionType,
      } = req.body;
      const images = req.files;

      const updateData = {};
      const book = await Book.findOne({ _id: id });

      if (!book) {
        return res.status(404).json({ message: "Book not found." });
      }
      const token = getToken(req);
    const user = await getUserByToken(token);
    if (book.user._id.toString() !== book._id.toString()) {
      return res
        .status(422)
        .json({ message: "You are not the owner of this book" });
    }
    if (
        !title ||
        !author ||
        !genre ||
        !language ||
        !condition ||
        !description ||
        !quantity ||
        !transactionType ||
        images.length === 0
      ) {
        return res.status(400).json({ message: "Please fill all the fields" });
      } else {
        updateData.images = [];
        images.map((image) => {
          updateData.images.push(image.filename);
        });
      }
      await Book.findByIdAndUpdate(id, updateData);
      return res.status(200).json({ message: "Book updated successfully" });
  }
};
