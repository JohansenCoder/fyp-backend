const express = require("express");
const router = express.Router();
const { getAllSubscriptions, createSubscription, getSubscriptionById, updateSubscription, deleteSubscription } = require("../controllers/subscriptionController");


// get all subscriptions
router.get("/", getAllSubscriptions);
// post subscription
router.post("/new" , createSubscription);

// get subscription by id
router.get("/:id", getSubscriptionById);

// update subscription
router.put("/:id", updateSubscription);

// delete subscription
router.delete("/:id", deleteSubscription);


module.exports = router;