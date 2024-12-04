const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "";
        if(req.baseUrl.includes('users')){
            folder = "users";
        }else if(req.baseUrl.includes('pets')){
            folder = "pets";
        }
        cb(null, `public/images/${folder}`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const imagesUpload = multer({
    storage: imageStorage,
    fileFilter(req, res, cb){
       if(!file.originalname.match(/\.(png|jpg)$/)){
        return cb(new Error('Only image files are allowed!'))
       }
       cb(undefined, true);
    }
    
});

module.exports = {imagesUpload};


