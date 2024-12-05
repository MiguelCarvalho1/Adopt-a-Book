const router = require('express').Router();

const UserController = require('../controller/UserController');

// Middleware
const verifyToken = require('../helpers/verify-token');
const { imagesUpload } = require('../helpers/image-upload');

// Rotas de usuário
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);



router.patch(
    '/edit/:id',
    verifyToken,
    imagesUpload.array('images'),
    UserController.editUser
);

module.exports = router;
