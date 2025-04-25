const User = require("../models/UserSchema");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            message: "Users fetched successfully",
            users: users
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users", error: error.message });
    }
}

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
        message: "User fetched successfully",
        user: user
    });
}

exports.createUser = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ ...req.body, password: hashedPassword });
        return res.status(201).json({
            message: "User created successfully",
            user: user
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating user", error: err.message });
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({
        message: "User not found"
    })

    if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
    }

    await User.findByIdAndUpdate(id, req.body);
    return res.status(200).json({
        message: "User updated successfully",
        user: req.body
    })
    
}

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User deleted successfully" });
}