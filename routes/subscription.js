const express = require("express");
const router = express.Router();
const { getAllSubscriptions, createSubscription, getSubscriptionById, updateSubscription, deleteSubscription } = require("../controllers/subscriptionController");
const { restrictToOrganizer, authMiddleware } = require('../middlewares/auth');  

// get all subscriptions
router.get("/", authMiddleware, restrictToOrganizer, getAllSubscriptions);
// post subscription
router.post("/new" , authMiddleware, restrictToOrganizer, createSubscription);

// get subscription by id
router.get("/:id", authMiddleware, restrictToOrganizer,  getSubscriptionById);

// update subscription
router.put("/:id", authMiddleware, restrictToOrganizer, updateSubscription);

// delete subscription
router.delete("/:id", authMiddleware, restrictToOrganizer, deleteSubscription);


module.exports = router;