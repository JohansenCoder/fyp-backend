const express = require("express");
const router = express.Router();


// get all announcements
router.get("/", (req, res) => {
    console.log("Getting all announcements...")
} )
// post announcement
router.post("/new" , (req,res) => {
    console.log("Posting new announcement...")
})

module.exports = router;