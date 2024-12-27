const router = require("express").Router();
const BookController = require("../controller/BookController");
const  verifyToken  = require("../helpers/verify-token");
const { imageUpload } = require('../helpers/image-upload')



router.get('/', BookController.getAll);
router.post('/create', verifyToken, imageUpload.array('images'), BookController.create);
router.get('/mybooks', verifyToken, BookController.getAllUserBooks);
router.get('/:id', BookController.getBookById);
router.patch(
    '/:id',
    verifyToken,
    imageUpload.array('images'),
     BookController.updateBook);

router.delete('/:id', verifyToken, BookController.removeBookById);

// Rota para buscar livros por gênero
router.get('/genre/:genre', BookController.getBooksByGenre);

// Rota para buscar os top livros de um gênero
router.get('/genre/:genre/top', BookController.getTopBooksByGenre);

module.exports = router;
