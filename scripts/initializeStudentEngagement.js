// scripts/initializeStudentEngagement.js
const mongoose = require('mongoose');
const User = require('../models/UserSchema');
require('dotenv').config();

/**
 * Migration script to initialize student engagement tracking for existing students
 */

async function initializeStudentEngagement() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database successfully');

    console.log('Finding all students without engagement data...');
    
    // Find all students who don't have studentEngagement field or have incomplete data
    const students = await User.find({
      role: 'student',
      $or: [
        { studentEngagement: { $exists: false } },
        { 'studentEngagement.postsCreated': { $exists: false } }
      ]
    });

    console.log(`Found ${students.length} students to update`);

    if (students.length === 0) {
      console.log('No students need initialization');
      return;
    }

    // Initialize engagement data for each student
    for (const student of students) {
      const updateData = {
        'studentEngagement.postsCreated': 0,
        'studentEngagement.alumniConnections': 0,
        'studentEngagement.eventsRegistered': 0,
        'studentEngagement.eventsAttended': 0,
        'studentEngagement.mentorshipRequests': 0,
        'studentEngagement.activeMentorships': 0,
        'studentEngagement.lastEngagementDate': null
      };

      await User.findByIdAndUpdate(student._id, { $set: updateData });
      console.log(`Initialized engagement data for student: ${student.username}`);
    }

    console.log('Student engagement initialization completed successfully!');

  } catch (error) {
    console.error('Error initializing student engagement:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  initializeStudentEngagement()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = initializeStudentEngagement;
