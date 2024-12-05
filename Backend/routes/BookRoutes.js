const router = require('express').Router();
const BookController = require('../controllers/BookController');


const { verifyToken } = require('../helpers/verify-token');
const {imagesUpload} = require('../helpers/image-upload');



router.post('/add', verifyToken, imagesUpload.array('images'), BookController.addBook); 
router.get('/', BookController.getBooks);
router.get('/:id', BookController.getBookById);
router.get('/mybooks', verifyToken, BookController.getMyBooks);
router.put('/:id', verifyToken,imagesUpload.array('images'), BookController.updateBook);
router.delete('/:id', verifyToken, BookController.deleteBook);

module.exports = router;