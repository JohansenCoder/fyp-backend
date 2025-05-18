const User = require('../models/UserSchema');
const AuditLog = require('../models/AuditLogSchema');
const bcrypt = require("bcryptjs");
const { logAdminAction } = require('../utils/auditLog');
const { notifyAdminAction } = require('../services/notificationService');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { profile } = req.body;
        const user = await User.findById(req.params.id);

        if(!user) return res.status(404).json({ message: 'User not found' });

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
        // Log the action
        await logAdminAction({
            admin: req.user,
            action: 'create_user',
            targetResource: 'user',
            targetId: user._id,
            details: { username: user.username, role: user.role },
            ipAddress: req.ip,
        });
        // Notify admin action
        await notifyAdminAction({
            college: user.college,
            message: `User "${user.username}" created`,
            actionType: 'User Created',
            logId,
        });

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

        if(!users) return res.status(404).json({message:"No Users Found!!"})

        await logAdminAction({
            admin: req.user,
            action: 'view_users',
            targetResource: 'user',
            targetId: null, // No specific user
            details: { page, limit, role, college },
            ipAddress: req.ip,
        });
        
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
                college: profile.college || user.profile.college,
                location: profile.location || user.profile.location,
                bio: profile.bio || user.profile.bio,
                profilePicture: profile.profilePicture || user.profile.profilePicture,
                industry: profile.industry || user.profile.industry,
                expertise: profile.expertise || user.profile.expertise,
                company: profile.company || user.profile.company,
                jobTitle: profile.jobTitle || user.profile.jobTitle,
            };
        }

        await user.save();

        // Log admin action
        await AuditLog.create({
            action: 'user_updated',
            performedBy: req.user._id,
            targetUser: user._id,
            targetResource: 'user',
            targetId: user._id,
            details: `User ${user.username} updated (role: ${role}, profile: ${JSON.stringify(profile)})`,
        });
        // Notify admin action
        await notifyAdminAction({
            college: user.college,
            message: `User "${user.username}" updated`,
            actionType: 'User Updated',
            logId,
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
            targetResource: 'user',
            targetId: user._id,
            details: `User ${user.username} deleted`,
        });
        // Notify admin action
        await notifyAdminAction({
            college: user.college,
            message: `User "${user.username}" deleted`,
            actionType: 'User Deleted',
            logId,
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};