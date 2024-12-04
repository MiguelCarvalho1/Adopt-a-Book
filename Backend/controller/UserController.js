const bcrypt = require("bcrypt");
const User = require("../models/User");
const createUserToken = require("../helpers/create-user-token");
const getUserByToken = require("../helpers/get-user-by-token");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/get-token");

module.exports = class UserController {
  //Register
  static async register(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmpassword) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    try {
      const newUser = await newUser.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  }

  //Login
  static async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }
    if (!password) {
      return res.status(404).json({ message: "Password required!" });
    }
    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ message: "Invalid password" });
    }
    //create token
    await createUserToken(user, req, res);
  }
  static async checkUser(req, res) {
    let currentUser;
    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "ourSecret");
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.status(200).send(currentUser);
  }

  //Check User By Id
  static async checkUserById(req, res) {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  }

  //Edit user
  static async editUser(req, res) {
    const id = req.params.id;
    const token = getToken(req);
    const user = await getUserByToken(token);

    
    if(req.file){
        user.image = req.file.filename;
    }

    // validation
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, password, phone, confirmpassword } = req.body;

    // validation
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    user.name = name;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // verify email
    const userExists = await User.findOne({ email });
    if (user.email !== email && userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }
    user.email = email;

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    } else if (password === confirmpassword && password != null) {
      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
    }

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }
    user.phone = phone;

    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      ); //save user

      res.status(200).json({
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
