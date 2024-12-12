const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

// helpers
const getUserByToken = require('../helpers/get-user-by-token')
const getToken = require('../helpers/get-token')
const createUserToken = require('../helpers/create-user-token')
const { imageUpload } = require('../helpers/image-upload')

module.exports = class UserController {
  static async register(req, res) {
    const name = req.body.name
    const email = req.body.email
    const location = req.body.location
    const password = req.body.password
    const confirmpassword = req.body.confirmpassword

    // validations
    if (!name) {
      res.status(422).json({ message: 'Name required!' })
      return
    }

    if (!email) {
      res.status(422).json({ message: 'Email is mandatory!' })
      return
    }

    if (!location) {
      res.status(422).json({ message: 'Location is mandatory!' })
      return
    }

    if (!password) {
      res.status(422).json({ message: 'The password is mandatory!' })
      return
    }

    if (!confirmpassword) {
      res.status(422).json({ message: 'Password confirmation is mandatory!' })
      return
    }

    if (password != confirmpassword) {
      res
        .status(422)
        .json({ message: 'The password and confirmation must be the same!' })
      return
    }

    // check if user exists
    const userExists = await User.findOne({ email: email })

    if (userExists) {
      res.status(422).json({ message: 'Please use another e-mail address!' })
      return
    }

    // create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // create user
    const user = new User({
      name: name,
      email: email,
      password: passwordHash,
      location: location,
    })

    try {
      const newUser = await user.save()

      await createUserToken(newUser, req, res)
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }

  static async login(req, res) {
    const email = req.body.email
    const password = req.body.password

    if (!email) {
      res.status(422).json({ message: 'Email is mandatory!' })
      return
    }

    if (!password) {
      res.status(422).json({ message: 'The password is mandatory!' })
      return
    }

    // check if user exists
    const user = await User.findOne({ email: email })

    if (!user) {
      return res
        .status(422)
        .json({ message: 'There is no user registered with this e-mail address!' })
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
      return res.status(422).json({ message: 'Invalid password' })
    }

    await createUserToken(user, req, res)
  }

  static async checkUser(req, res) {
    let currentUser

    console.log(req.headers.authorization)

    if (req.headers.authorization) {
      const token = getToken(req)
      const decoded = jwt.verify(token, 'ourSecret')

      currentUser = await User.findById(decoded.id)

      currentUser.password = undefined
    } else {
      currentUser = null
    }

    res.status(200).send(currentUser)
  }

  static async getUserById(req, res) {
    const id = req.params.id

    const user = await User.findById(id)

    if (!user) {
      res.status(422).json({ message: 'User not found!' })
      return
    }

    res.status(200).json({ user })
  }

  static async editUser(req, res) {
    const token = getToken(req)

    //console.log(token);

    const user = await getUserByToken(token)

    // console.log(user);
    // console.log(req.body)
    // console.log(req.file.filename)

    const name = req.body.name
    const email = req.body.email
    const location = req.body.location
    const password = req.body.password
    const confirmpassword = req.body.confirmpassword

    let image = ''

    if (req.file) {
      image = req.file.filename
    }

    // validations
    if (!name) {
      res.status(422).json({ message: 'Name required!' })
      return
    }

    user.name = name

    if (!email) {
      res.status(422).json({ message: 'Email is mandatory!' })
      return
    }

    // check if user exists
    const userExists = await User.findOne({ email: email })

    if (user.email !== email && userExists) {
      res.status(422).json({ message: 'Please use another e-mail address!' })
      return
    }

    user.email = email

    if (image) {
      const imageName = req.file.filename
      user.image = imageName
    }

    if (!location) {
      res.status(422).json({ message: 'Location is mandatory!' })
      return
    }

    user.location = location

    // check if password match
    if (password != confirmpassword) {
      res.status(422).json({ error: "The passwords don't match." })

      // change password
    } else if (password == confirmpassword && password != null) {
      // creating password
      const salt = await bcrypt.genSalt(12)
      const reqPassword = req.body.password

      const passwordHash = await bcrypt.hash(reqPassword, salt)

      user.password = passwordHash
    }

    try {
      // returns updated data
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true },
      )
      res.json({
        message: 'User successfully updated!',
        data: updatedUser,
      })
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }
}
