const express = require("express");
const router = express.Router();
const { getAllNews, createNews, getNewsById, updateNews, deleteNews } = require("../controllers/newsController");
const { protect, authorize } = require('../middlewares/auth');

// get all news
router.get("/", protect, authorize('admin', 'student', 'staff', 'alumni'), getAllNews);
// post news
router.post("/new" , protect, authorize('admin'), createNews);

// get news by id
router.get("/:id", protect, authorize('admin', 'student', 'staff', 'alumni'), getNewsById);

// update news
router.put("/:id", protect, authorize('admin'), updateNews);

// delete news
router.delete("/:id", protect, authorize('admin'), deleteNews);


module.exports = router;