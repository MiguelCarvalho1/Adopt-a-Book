const router = require("express").Router();
const BookController = require("../controller/BookController");
const  verifyToken  = require("../helpers/verify-token");
const { imageUpload } = require('../helpers/image-upload')



router.get('/', BookController.getBooks);
router.post('/create', verifyToken, imageUpload.array('images'), BookController.create);
router.get('/mybooks', verifyToken, BookController.getMyBooks);
router.get('/:id', BookController.getBookById);
router.patch(
    '/:id',
    verifyToken,
    imageUpload.array('images'),
     BookController.updateBook);

router.delete('/:id', verifyToken, BookController.removeBook);

router.get('/home', BookController.getHomeBooks);

module.exports = router;
