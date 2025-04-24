# UDSM Connect Mobile App Backend

## Overview
UDSM Connect is a comprehensive mobile application designed to enhance the university experience for students at the University of Dar es Salaam (UDSM). This repository contains the backend services that power the UDSM Connect mobile application.

## Features
- User Authentication and Authorization
- Academic Resources Management
- Campus Events and Activities
- Student Services Integration
- Social Networking Features
- Campus Navigation
- Emergency Services
- Library Services
- Academic Calendar
- Student Support Services

## Tech Stack
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- RESTful API Architecture

## Project Structure
```
fyp-backend/
├── controllers/     # Business logic for handling requests
├── models/         # Database models and schemas
├── routes/         # API route definitions
├── middlewares/    # Custom middleware functions
├── db.js          # Database connection configuration
└── index.js       # Main application entry point
```

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- pnpm (Package Manager)

## Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/fyp-backend.git
cd fyp-backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
pnpm dev
```

## API Documentation
The API documentation is available at `/api-docs` when running the server in development mode.

## Development Guidelines
1. Follow the established project structure
2. Write meaningful commit messages
3. Create feature branches for new functionality
4. Test all new features before submitting pull requests
5. Document new API endpoints

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
For any queries or support, please contact the development team at [your-email@example.com]

## Acknowledgments
- University of Dar es Salaam
- All contributors and maintainers
