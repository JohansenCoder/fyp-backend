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

// config imports
const passport = require("./config/passport");
const connectDB = require("./config/db");
// const { scheduleEventReminders } = require('./scheduler');

// connect to MongoDB
connectDB();

// Start scheduler
// scheduleEventReminders();

// route imports
const announcements = require("./routes/announcements");
const users = require("./routes/users");
const news = require("./routes/news");
const events = require("./routes/events");
const auditLogs = require("./routes/auditLogs");
const emergencyContacts = require("./routes/emergencyContact")
const authRoutes = require("./routes/AuthRoutes");
const alumni = require("./routes/alumni");
const feed = require('./routes/feed');
const mentorshipRequest = require('./routes/mentorshipRequest');
const dashboard = require('./routes/dashboard');



// app instance
const app = express();

// middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://192.168.1.3:3000',
    'http://192.168.1.3:5173',
    'http://192.168.1.5:3000',
    'http://192.168.1.5:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));
app.use(logger);
app.use(helmet());
app.use(morgan('combined')); // Log all requests
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files




// routes
app.get("/", (req, res) => {
  return res.json({
    message: "Your server is running!"
  })
})

app.use("/api/announcements", announcements)
app.use("/api/users", users)
app.use("/api/news", news)
app.use("/api/events", events)
app.use("/api/auditLogs", auditLogs)
app.use("/api/emergencyContacts", emergencyContacts)
app.use("/api/authentication", authRoutes)
app.use("/api/alumni", alumni)
app.use("/api/feed", feed)
app.use("/api/mentorshipRequest", mentorshipRequest)
app.use("/api/dashboard", dashboard);

// Error handling
app.use(errorHandler);

PORT = process.env.PORT || 7000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.1.5:${PORT}`);
  console.log(`Server is accepting connections from all interfaces (0.0.0.0)`);
});
