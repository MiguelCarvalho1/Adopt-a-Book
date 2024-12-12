const jwt = require('jsonwebtoken');

const createUserToken = async(user, req, res) =>{
    const token = jwt.sign({
        name : user.name,
        id : user._id
        },
        "ourSecret"
    );

    //return token
    res.status(200).json({
        message: "You're connected!",
        token: token,
        userId : user._id,
        });
}
module.exports = createUserToken;