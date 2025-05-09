const express = require("express");
const router = express.Router();
const { getAllNews, createNews, getNewsById, updateNews, deleteNews } = require("../controllers/newsController");
const { authMiddleware, restrictToAdmin } = require("../middlewares/auth");


// create news (admin only)
router.post("/", authMiddleware, restrictToAdmin, createNews);

// get all news (public)
router.get("/", authMiddleware, getAllNews);

// get news by ID (public)
router.get("/:id", authMiddleware, getNewsById);

// update news (admin only)
router.put("/:id", authMiddleware, restrictToAdmin, updateNews);

// delete news (admin only)
router.delete("/:id", authMiddleware, restrictToAdmin, deleteNews);

module.exports = router;