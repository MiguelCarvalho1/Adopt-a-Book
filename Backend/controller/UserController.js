const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const createUserToken = require("../helpers/create-user-token");
const getUserByToken = require("../helpers/get-user-by-token");
const getToken = require("../helpers/get-token");

module.exports = class UserController {
  // Register
  static async register(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmpassword) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
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
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  }

  // Login
  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token
    await createUserToken(user, req, res);
  }

  static async getUserById(req, res) {
    const { id } = req.params;
  
    try {
      // Buscar o usuário pelo ID e excluir o campo de senha
      const user = await User.findById(id).select("-password");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Check current user
  static async checkUser(req, res) {
    try {
      const token = getToken(req);
      const decoded = jwt.verify(token, "ourSecret");
      const currentUser = await User.findById(decoded.id).select("-password");

      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.status(200).json(currentUser);
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Check user by ID
  static async checkUserById(req, res) {
    const id = req.params.id;

    try {
      const user = await User.findById(id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Edit user
  static async editUser(req, res) {
    const id = req.params.id;
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, password, phone, confirmpassword } = req.body;

    // Update user fields
    if (name) user.name = name;

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && user.email !== email) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    if (password && password === confirmpassword) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    } else if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (phone) user.phone = phone;

    if (req.file) user.image = req.file.filename;

    try {
      await User.findByIdAndUpdate(user._id, user, { new: true });
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
