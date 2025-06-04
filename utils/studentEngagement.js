// utils/studentEngagement.js
const User = require('../models/UserSchema');
const { logAdminAction } = require('./auditLog');

/**
 * Student Engagement Tracking Utilities
 * These functions help track and update student engagement metrics
 */

class StudentEngagementTracker {
  
  /**
   * Increment post count for a student
   * @param {String} userId - Student's user ID
   */
  static async incrementPostCount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'student') {
        return false;
      }

      await User.findByIdAndUpdate(userId, {
        $inc: { 'studentEngagement.postsCreated': 1 },
        $set: { 'studentEngagement.lastEngagementDate': new Date() }
      });      await logAdminAction({
        admin: { id: userId, username: 'system' },
        action: 'student_engagement_post_created',
        targetResource: 'user',
        targetId: userId,
        details: {
          metric: 'postsCreated',
          newCount: user.studentEngagement.postsCreated + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing post count:', error);
      return false;
    }
  }

  /**
   * Increment alumni connection count for a student
   * @param {String} studentId - Student's user ID
   * @param {String} alumniId - Alumni's user ID
   */
  static async incrementAlumniConnection(studentId, alumniId) {
    try {
      const student = await User.findById(studentId);
      const alumni = await User.findById(alumniId);
      
      if (!student || student.role !== 'student' || !alumni || alumni.role !== 'alumni') {
        return false;
      }

      await User.findByIdAndUpdate(studentId, {
        $inc: { 'studentEngagement.alumniConnections': 1 },
        $set: { 'studentEngagement.lastEngagementDate': new Date() }
      });      await logAdminAction({
        admin: { id: studentId, username: 'system' },
        action: 'student_engagement_alumni_connection',
        targetResource: 'user',
        targetId: studentId,
        details: {
          metric: 'alumniConnections',
          connectedWith: alumniId,
          newCount: student.studentEngagement.alumniConnections + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing alumni connection count:', error);
      return false;
    }
  }

  /**
   * Increment event registration count for a student
   * @param {String} userId - Student's user ID
   * @param {String} eventId - Event ID
   */
  static async incrementEventRegistration(userId, eventId) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'student') {
        return false;
      }

      await User.findByIdAndUpdate(userId, {
        $inc: { 'studentEngagement.eventsRegistered': 1 },
        $set: { 'studentEngagement.lastEngagementDate': new Date() }
      });      await logAdminAction({
        admin: { id: userId, username: 'system' },
        action: 'student_engagement_event_registered',
        targetResource: 'user',
        targetId: userId,
        details: {
          metric: 'eventsRegistered',
          eventId: eventId,
          newCount: user.studentEngagement.eventsRegistered + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing event registration count:', error);
      return false;
    }
  }

  /**
   * Decrement event registration count when student unregisters
   * @param {String} userId - Student's user ID
   * @param {String} eventId - Event ID
   */
  static async decrementEventRegistration(userId, eventId) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'student' || user.studentEngagement.eventsRegistered <= 0) {
        return false;
      }

      await User.findByIdAndUpdate(userId, {
        $inc: { 'studentEngagement.eventsRegistered': -1 },
        $set: { 'studentEngagement.lastEngagementDate': new Date() }
      });      await logAdminAction({
        admin: { id: userId, username: 'system' },
        action: 'student_engagement_event_unregistered',
        targetResource: 'user',
        targetId: userId,
        details: {
          metric: 'eventsRegistered',
          eventId: eventId,
          newCount: user.studentEngagement.eventsRegistered - 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error decrementing event registration count:', error);
      return false;
    }
  }

  /**
   * Increment mentorship request count for a student
   * @param {String} studentId - Student's user ID
   * @param {String} mentorId - Mentor's user ID
   */
  static async incrementMentorshipRequest(studentId, mentorId) {
    try {
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        return false;
      }

      await User.findByIdAndUpdate(studentId, {
        $inc: { 'studentEngagement.mentorshipRequests': 1 },
        $set: { 'studentEngagement.lastEngagementDate': new Date() }
      });      await logAdminAction({
        admin: { id: studentId, username: 'system' },
        action: 'student_engagement_mentorship_requested',
        targetResource: 'user',
        targetId: studentId,
        details: {
          metric: 'mentorshipRequests',
          mentorId: mentorId,
          newCount: student.studentEngagement.mentorshipRequests + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing mentorship request count:', error);
      return false;
    }
  }

  /**
   * Increment active mentorship count when request is accepted
   * @param {String} studentId - Student's user ID
   * @param {String} mentorId - Mentor's user ID
   */
  static async incrementActiveMentorship(studentId, mentorId) {
    try {
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        return false;
      }

      await User.findByIdAndUpdate(studentId, {
        $inc: { 'studentEngagement.activeMentorships': 1 },
        $set: { 'studentEngagement.lastEngagementDate': new Date() }
      });      await logAdminAction({
        admin: { id: studentId, username: 'system' },
        action: 'student_engagement_mentorship_activated',
        targetResource: 'user',
        targetId: studentId,
        details: {
          metric: 'activeMentorships',
          mentorId: mentorId,
          newCount: student.studentEngagement.activeMentorships + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing active mentorship count:', error);
      return false;
    }
  }

  /**
   * Get student engagement statistics
   * @param {String} userId - Student's user ID
   * @returns {Object} - Student engagement data
   */
  static async getStudentEngagementStats(userId) {
    try {
      const user = await User.findById(userId).select('studentEngagement role');
      if (!user || user.role !== 'student') {
        return null;
      }

      return {
        postsCreated: user.studentEngagement.postsCreated || 0,
        alumniConnections: user.studentEngagement.alumniConnections || 0,
        eventsRegistered: user.studentEngagement.eventsRegistered || 0,
        eventsAttended: user.studentEngagement.eventsAttended || 0,
        mentorshipRequests: user.studentEngagement.mentorshipRequests || 0,
        activeMentorships: user.studentEngagement.activeMentorships || 0,
        lastEngagementDate: user.studentEngagement.lastEngagementDate,
        engagementScore: this.calculateEngagementScore(user.studentEngagement)
      };
    } catch (error) {
      console.error('Error getting student engagement stats:', error);
      return null;
    }
  }

  /**
   * Calculate engagement score based on various metrics
   * @param {Object} engagement - Student engagement object
   * @returns {Number} - Engagement score (0-100)
   */
  static calculateEngagementScore(engagement) {
    if (!engagement) return 0;

    const weights = {
      postsCreated: 2,
      alumniConnections: 5,
      eventsRegistered: 3,
      eventsAttended: 4,
      mentorshipRequests: 3,
      activeMentorships: 8
    };

    let score = 0;
    score += (engagement.postsCreated || 0) * weights.postsCreated;
    score += (engagement.alumniConnections || 0) * weights.alumniConnections;
    score += (engagement.eventsRegistered || 0) * weights.eventsRegistered;
    score += (engagement.eventsAttended || 0) * weights.eventsAttended;
    score += (engagement.mentorshipRequests || 0) * weights.mentorshipRequests;
    score += (engagement.activeMentorships || 0) * weights.activeMentorships;

    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Get engagement statistics for all students (admin only)
   * @returns {Array} - Array of student engagement data
   */
  static async getAllStudentEngagementStats() {
    try {
      const students = await User.find({ role: 'student' })
        .select('username email profile.firstName profile.lastName studentEngagement')
        .lean();

      return students.map(student => ({
        userId: student._id,
        username: student.username,
        email: student.email,
        name: `${student.profile?.firstName || ''} ${student.profile?.lastName || ''}`.trim(),
        engagement: {
          ...student.studentEngagement,
          engagementScore: this.calculateEngagementScore(student.studentEngagement)
        }
      }));
    } catch (error) {
      console.error('Error getting all student engagement stats:', error);
      return [];
    }
  }
}

module.exports = StudentEngagementTracker;
