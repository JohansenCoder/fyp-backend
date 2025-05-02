// package imports
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require('helmet');
const morgan = require('morgan');
dotenv.config();


// middleware imports
const logger = require("./middlewares/logger");
const errorHandler = require('./middlewares/errorHandler');
const { authSecurity } = require("./middlewares/authSecurity");


// config imports
const passport = require("./config/passport");
const connectDB = require("./config/db");

// connect to MongoDB
connectDB();

// route imports
const announcements = require("./routes/announcements");
const users = require("./routes/users");
const news = require("./routes/news");
const subscription = require("./routes/subscription");
const DynamicEvents = require("./routes/Dynamicevents");
const adminLogs = require("./routes/adminLogs");
const emergencyContacts = require("./routes/emergencyContact")
const authRoutes = require("./routes/AuthRoutes");



// app instance
const app = express();

// middlewares
app.use(cors());
app.use(logger);
app.use(helmet());
app.use(morgan('combined')); // Log all requests
app.use(express.json());




// routes
app.get("/", (req, res) => {
    return res.json({
        message: "Your server is running!"
    })
})

app.use("/api/announcements", announcements)
app.use("/api/users", users)
app.use("/api/news", news)
app.use("/api/subscriptions", subscription)
app.use("/api/dynamicevents", DynamicEvents)
app.use("/api/adminLogs", adminLogs)
app.use("/api/emergencyContacts", emergencyContacts)
app.use("/api/authentication",authSecurity, authRoutes)

// Error handling
app.use(errorHandler);

PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
