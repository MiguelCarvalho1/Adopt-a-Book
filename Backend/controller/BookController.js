const getUserByToken = require("../helpers/get-user-by-token");
const getToken = require("../helpers/get-token");
const Book = require("../models/Book");
const ObjectId = require("mongoose").Types.ObjectId;

const BookService = require('../service/BookService');  

module.exports = class BookController {



    static async getHomeBooks(req, res) {
        try {
          const query = 'bestseller'; // Exemplo de busca
          const books = await BookService.searchBooks(query);
          if (books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
          }
          res.status(200).json(books); 
        } catch (error) {
          res.status(500).json({ message: 'Error fetching books', error: error.message });
        }
      }
      






    static async create(req, res) {
        const { title, author, genre, language, condition, description, quantity, transactionType } = req.body;
        const images = req.files;
    
        // Validação
        if (!title || !author || !condition || !quantity || !transactionType || images.length === 0) {
          return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
        }
    
        const token = getToken(req);
        const user = await getUserByToken(token);
    
        const book = new Book({
          title,
          author,
          genre,
          language,
          condition,
          description,
          quantity,
          images: [],
          transactionType,
          user: {
            _id: user._id,
            name: user.name,
            image: user.profileImage,
          },
        });
    
        images.map((image) => {
          book.images.push(image.filename);
        });
    
        try {
          const newBook = await book.save();
          return res.status(201).json(newBook);
        } catch (error) {
          return res.status(400).json({ message: "Erro ao criar o livro." });
        }
      }

    static async getBooks(req, res) {
        try {
            const books = await Book.find().sort("-createdAt");
            res.status(200).json({ books });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro no servidor." });
        }
    }

    static async getMyBooks(req, res) {
        try {
            const token = getToken(req);
            const user = await getUserByToken(token);

            if (!user) {
                return res.status(401).json({ message: "Usuário não autorizado." });
            }

            const books = await Book.find({ "user._id": user._id }).sort("-createdAt");
            res.status(200).json({ books });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Erro no servidor." });
        }
    }

    static async getBookById(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido." });
        }

        try {
            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({ message: "Livro não encontrado." });
            }
            res.status(200).json({ book });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro no servidor." });
        }
    }

    static async removeBook(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido." });
        }

        try {
            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({ message: "Livro não encontrado." });
            }

            const token = getToken(req);
            const user = await getUserByToken(token);

            if (book.user._id.toString() !== user._id.toString()) {
                return res.status(403).json({ message: "Você não tem permissão para deletar este livro." });
            }

            await Book.findByIdAndDelete(id);
            res.status(200).json({ message: "Livro deletado com sucesso." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro no servidor." });
        }
    }

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

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido." });
        }

        try {
            const book = await Book.findById(id);
            if (!book) {
                return res.status(404).json({ message: "Livro não encontrado." });
            }

            const token = getToken(req);
            const user = await getUserByToken(token);

            if (book.user._id.toString() !== user._id.toString()) {
                return res.status(403).json({ message: "Você não tem permissão para atualizar este livro." });
            }

            const updateData = {
                title,
                author,
                genre,
                language,
                condition,
                description,
                quantity,
                transactionType,
                images: images.map((image) => image.filename),
            };

            await Book.findByIdAndUpdate(id, updateData);
            res.status(200).json({ message: "Livro atualizado com sucesso." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro no servidor." });
        }
    }
};
