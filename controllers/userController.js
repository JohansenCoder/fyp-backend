// exports.updateUser = async (req, res) => {
//     const { id } = req.params;
//     const user = await User.findById(id);

//     if (!user) return res.status(404).json({
//         message: "User not found"
//     })

//     if (req.body.password) {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         req.body.password = hashedPassword;
//     }

//     await User.findByIdAndUpdate(id, req.body);
//     return res.status(200).json({
//         message: "User updated successfully",
//         user: req.body
//     })
    
// }



const User = require('../models/UserSchema');
const AuditLog = require('../models/AuditLog');
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { profile } = req.body;
        const user = await User.findById(req.user._id);

        user.profile = {
            ...user.profile,
            firstName: profile.firstName || user.profile.firstName,
            lastName: profile.lastName || user.profile.lastName,
            department: profile.department || user.profile.department,
            graduationYear: profile.graduationYear || user.profile.graduationYear,
            phone: profile.phone || user.profile.phone,
            faculty: profile.faculty || user.profile.faculty,
        };

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

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


exports.updateUser = async (req, res) => {
    try {
        const { role, profile } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) user.role = role;
        if (profile) {
            user.profile = {
                ...user.profile,
                firstName: profile.firstName || user.profile.firstName,
                lastName: profile.lastName || user.profile.lastName,
                department: profile.department || user.profile.department,
                graduationYear: profile.graduationYear || user.profile.graduationYear,
                phone: profile.phone || user.profile.phone,
                faculty: profile.faculty || user.profile.faculty,
            };
        }

        await user.save();

        // Log admin action
        await AuditLog.create({
            action: 'user_updated',
            performedBy: req.user._id,
            targetUser: user._id,
            details: `User ${user.username} updated (role: ${role}, profile: ${JSON.stringify(profile)})`,
        });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        // Log admin action
        await AuditLog.create({
            action: 'user_deleted',
            performedBy: req.user._id,
            targetUser: user._id,
            details: `User ${user.username} deleted`,
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};