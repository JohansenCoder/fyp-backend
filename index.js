// package imports
const express = require("express");
const connectDB = require("./db");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
connectDB();

// middleware imports
const logger = require("./middlewares/logger");

// route imports
const announcements = require("./routes/announcements");
const users = require("./routes/users");

// app instance
const app = express();

// middlewares
app.use(cors());
app.use(logger);
app.use(express.json());

// routes
app.get("/", (req, res) => {
    return res.json({
        message: "Your server is running!"
    })
})

app.use("/api/announcements", announcements)
app.use("/api/users", users)

PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
