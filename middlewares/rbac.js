const checkRole = (roles) => (req, res, next) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
};

module.exports = { checkRole };