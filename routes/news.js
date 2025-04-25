const express = require("express");
const router = express.Router();
const { getAllNews, createNews, getNewsById, updateNews, deleteNews } = require("../controllers/newsController");


// get all news
router.get("/", getAllNews);
// post news
router.post("/new" , createNews);

// get news by id
router.get("/:id", getNewsById);

// update news
router.put("/:id", updateNews);

// delete news
router.delete("/:id", deleteNews);


module.exports = router;