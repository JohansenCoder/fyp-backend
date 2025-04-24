const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController");

// get all users
router.get("/", getAllUsers);

// get user by id
router.get("/:id", getUserById);

// create user
router.post("/", createUser);

// update user
router.put("/:id", updateUser)
// delete user
router.delete("/:id", deleteUser);

module.exports = router;