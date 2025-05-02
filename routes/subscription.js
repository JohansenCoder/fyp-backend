const express = require("express");
const router = express.Router();
const { getAllSubscriptions, createSubscription, getSubscriptionById, updateSubscription, deleteSubscription } = require("../controllers/subscriptionController");
const { protect, authorize } = require('../middlewares/auth');  

// get all subscriptions
router.get("/",  protect, authorize('admin', 'student', 'staff', 'alumni'), getAllSubscriptions);
// post subscription
router.post("/new" ,  protect, authorize('admin', 'student', 'staff', 'alumni'), createSubscription);

// get subscription by id
router.get("/:id",  protect, authorize('admin', 'student', 'staff', 'alumni'), getSubscriptionById);

// update subscription
router.put("/:id",  protect, authorize('admin', 'student', 'staff', 'alumni'), updateSubscription);

// delete subscription
router.delete("/:id",  protect, authorize('admin', 'student', 'staff', 'alumni'), deleteSubscription);


module.exports = router;