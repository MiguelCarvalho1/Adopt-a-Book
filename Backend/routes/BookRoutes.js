const router = require("express").Router();
const BookController = require("../controller/BookController");
const  verifyToken  = require("../helpers/verify-token");
const { imagesUpload } = require("../helpers/image-upload");



router.get('/', BookController.getBooks);
router.post('/create', verifyToken, imagesUpload.array('images'), BookController.create);
router.get('/mybooks', verifyToken, BookController.getMyBooks);
router.get('/:id', BookController.getBookById);
router.put('/:id', verifyToken, imagesUpload.array("images"), BookController.updateBook);
router.delete('/:id', verifyToken, BookController.removeBook);

router.get('/home', BookController.getHomeBooks);

module.exports = router;
