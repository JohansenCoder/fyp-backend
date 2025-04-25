const Subscription = require('../models/SubscriptionSchema');


exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json({
            message: "Subscriptions fetched successfully",
            subscriptions: subscriptions
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching subscriptions", error: error.message });
    }
}

exports.createSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.create(req.body);
        return res.status(201).json({
            message: "Subscription created successfully",
            subscription: subscription
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating subscription", error: err.message });
    }
}

exports.getSubscriptionById = async (req, res) => {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);
    if (!subscription) { 
        return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json({
        message: "Subscription fetched successfully",
        subscription: subscription
    }); 
}

exports.updateSubscription = async (req, res) => {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);
    if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
    }
    await Subscription.findByIdAndUpdate(id, req.body);
    res.status(200).json({ message: "Subscription updated successfully" });
}

exports.deleteSubscription = async (req, res) => {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);
    if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
    }   
    await Subscription.findByIdAndDelete(id);
    res.status(200).json({ message: "Subscription deleted successfully" });
}





