// const rateLimit = require('express-rate-limit');

// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5, // Limit each IP to 10 requests per window
//     message: {
//         message: 'Too many requests from this IP, please try again after 5 minutes.',
//     },
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// module.exports = authLimiter;