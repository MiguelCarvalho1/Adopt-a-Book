const router = require('express').Router();

const UserController = require('../controller/UserController');

//middleware
const verifyToken = require('../helpers/verify-token');
const {imagesUpload} = require('../helpers/image-upload');



router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);
router.patch('/edit/:id',verifyToken,  UserController.editUser);
router.patch('/edit/:id',verifyToken, imagesUpload.single("image"),  UserController.editUser);



module.exports = router;