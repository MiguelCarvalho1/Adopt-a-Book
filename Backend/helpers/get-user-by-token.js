const jwt = require('jsonwebtoken');

const User = require ('../models/User'); 

const getUserByToken = async (token) =>{

    if (!token) {
        throw new Error("Access denied.");
    }

    const decoded = jwt.verify(token, 'ourSecret');

    const userId = decoded.id;

    const user = await User.findOne({_id : userId});

    return user;
}

module.exports = getUserByToken;