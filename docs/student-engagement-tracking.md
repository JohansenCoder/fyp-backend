# Student Engagement Tracking System

## Overview
The student engagement tracking system monitors and records various activities performed by students on the platform. This helps administrators understand student participation and engagement levels.

## Tracked Metrics

### For Students Only
- **Posts Created**: Number of posts created by the student
- **Alumni Connections**: Number of successful connections made with alumni
- **Events Registered**: Number of events the student has registered for
- **Events Attended**: Number of events actually attended (for future implementation)
- **Mentorship Requests**: Number of mentorship requests made
- **Active Mentorships**: Number of currently active mentorships
- **Last Engagement Date**: Timestamp of last activity

## Database Schema Changes

### UserSchema.js
Added `studentEngagement` object to the User model:
```javascript
studentEngagement: {
  postsCreated: { type: Number, default: 0 },
  alumniConnections: { type: Number, default: 0 },
  eventsRegistered: { type: Number, default: 0 },
  eventsAttended: { type: Number, default: 0 },
  mentorshipRequests: { type: Number, default: 0 },
  activeMentorships: { type: Number, default: 0 },
  lastEngagementDate: { type: Date },
}
```

## New API Endpoints

### Student Engagement Endpoints
1. **GET /api/users/engagement/my** - Get current student's engagement stats (students only)
2. **GET /api/users/engagement/all** - Get all students' engagement stats (admin only)
3. **GET /api/users/engagement/:id** - Get specific student's engagement stats (admin only)

## Automatic Tracking

### Post Creation
- **Trigger**: When a student creates a post in `/api/feed/posts`
- **Action**: Increments `postsCreated` counter
- **File**: `controllers/feedController.js`

### Alumni Connections
- **Trigger**: When connection request is accepted in `/api/alumni/connections/:id`
- **Action**: Increments `alumniConnections` counter for the student who made the request
- **File**: `controllers/alumniController.js`

### Event Registration
- **Trigger**: When student registers for event in `/api/events/register`
- **Action**: Increments `eventsRegistered` counter
- **File**: `controllers/eventController.js`

### Event Unregistration
- **Trigger**: When student unregisters from event in `/api/events/unregister/:id`
- **Action**: Decrements `eventsRegistered` counter
- **File**: `controllers/eventController.js`

### Mentorship Requests
- **Trigger**: When student creates mentorship request in `/api/alumni/mentors/:id`
- **Action**: Increments `mentorshipRequests` counter
- **File**: `controllers/alumniController.js`

### Active Mentorships
- **Trigger**: When mentorship request is accepted in `/api/alumni/mentors/:id`
- **Action**: Increments `activeMentorships` counter for the student
- **File**: `controllers/alumniController.js`

## Engagement Score Calculation

The system calculates an engagement score based on weighted metrics:
- Posts Created: Weight 2
- Alumni Connections: Weight 5
- Events Registered: Weight 3
- Events Attended: Weight 4
- Mentorship Requests: Weight 3
- Active Mentorships: Weight 8

**Maximum Score**: 100

## Usage Examples

### Get My Engagement Stats (Student)
```javascript
fetch('https://fyp-backend-production-53c6.up.railway.app/api/users/engagement/my', {
  headers: {
    'Authorization': 'Bearer <student_token>',
    'Content-Type': 'application/json'
  }
})
```

### Get All Students Engagement (Admin)
```javascript
fetch('https://fyp-backend-production-53c6.up.railway.app/api/users/engagement/all', {
  headers: {
    'Authorization': 'Bearer <admin_token>',
    'Content-Type': 'application/json'
  }
})
```

## Migration Script

Run the initialization script for existing students:
```bash
node scripts/initializeStudentEngagement.js
```

This script will:
- Find all existing students without engagement data
- Initialize all engagement metrics to 0
- Set up the tracking structure

## Audit Logging

All engagement activities are logged through the audit system with the following action types:
- `student_engagement_post_created`
- `student_engagement_alumni_connection`
- `student_engagement_event_registered`
- `student_engagement_event_unregistered`
- `student_engagement_mentorship_requested`
- `student_engagement_mentorship_activated`

## Files Modified

1. **models/UserSchema.js** - Added studentEngagement field
2. **utils/studentEngagement.js** - Created engagement tracking utility
3. **controllers/feedController.js** - Added post creation tracking
4. **controllers/alumniController.js** - Added connection and mentorship tracking
5. **controllers/eventController.js** - Added event registration tracking
6. **controllers/userController.js** - Added engagement retrieval endpoints
7. **routes/users.js** - Added engagement routes
8. **scripts/initializeStudentEngagement.js** - Migration script

## Security Considerations

- Only students can view their own engagement stats
- Only admins can view all students' engagement stats
- Engagement tracking is automatic and cannot be manually manipulated
- All activities are logged in the audit system
