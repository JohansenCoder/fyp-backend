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
         // Log the action
     const logId = await logAdminAction({
        admin: req.user,
        action: 'Subscription created',
        targetResource: 'Subscription',
        targetId: subscription._id,
        details: { title: subscription.title, updates: req.body },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: subscription.college,
        message: `Subscription "${subscription.title}" created`,
        actionType: 'Subscription Created',
        logId,
    });

        return res.status(201).json({
            message: "Subscription created successfully",
            subscription: subscription
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating subscription", error: err.message });
    }
}

exports.getSubscriptionById = async (req, res) => {
   try{
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
   catch (error) {
    return res.status(500).json({ message: "Error fetching subscription", error: error.message });
   }
}

exports.updateSubscription = async (req, res) => {
    try{
        const { id } = req.params;
    const subscription = await Subscription.findById(id);
    if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
    }
    await Subscription.findByIdAndUpdate(id, req.body);
     // Log the action
     const logId = await logAdminAction({
        admin: req.user,
        action: 'Subscription updated',
        targetResource: 'Subscription',
        targetId: subscription._id,
        details: { title: subscription.title, updates: req.body },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: subscription.college,
        message: `Subscription "${subscription.title}" updated`,
        actionType: 'Subscription Updated',
        logId,
    });

    res.status(200).json({ message: "Subscription updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating subscription", error: error.message });
    }
}

exports.deleteSubscription = async (req, res) => {
    try{
        const { id } = req.params;
    const subscription = await Subscription.findById(id);
    if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
    }   
    await Subscription.findByIdAndDelete(id);

     // Log the action
     const logId = await logAdminAction({
        admin: req.user,
        action: 'Subscription deleted',
        targetResource: 'Subscription',
        targetId: subscription._id,
        details: { title: subscription.title, updates: req.body },
        ipAddress: req.ip,
    });

    await notifyAdminAction({
        college: subscription.college,
        message: `Subscription "${subscription.title}" deleted`,
        actionType: 'Subscription Deleted',
        logId,
    });
    
    res.status(200).json({ message: "Subscription deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error deleting subscription", error: error.message });
    }
}





