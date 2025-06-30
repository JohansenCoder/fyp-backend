const User = require('../models/UserSchema');
const { logAdminAction } = require('./auditLog');

/**
 * Universal Engagement Tracking System
 * Handles engagement metrics for Students, Alumni, College Admins, and System Admins
 */

class EngagementTracker {
  
  // ============================================
  // COMMON ENGAGEMENT METHODS (Students & Alumni)
  // ============================================

  /**
   * Increment post count for students and alumni
   * @param {String} userId - User ID
   */
  static async incrementPostCount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !['student', 'alumni'].includes(user.role)) {
        return false;
      }

      const engagementField = user.role === 'student' ? 'studentEngagement' : 'alumniEngagement';
      
      await User.findByIdAndUpdate(userId, {
        $inc: { [`${engagementField}.postsCreated`]: 1 },
        $set: { [`${engagementField}.lastEngagementDate`]: new Date() }
      });

      await logAdminAction({
        admin: { id: userId, username: 'system' },
        action: `${user.role}_engagement_post_created`,
        targetResource: 'user',
        targetId: userId,
        details: {
          metric: 'postsCreated',
          role: user.role,
          newCount: user[engagementField].postsCreated + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing post count:', error);
      return false;
    }
  }

  /**
   * Increment event registration for students and alumni
   * @param {String} userId - User ID
   * @param {String} eventId - Event ID
   */
  static async incrementEventRegistration(userId, eventId) {
    try {
      const user = await User.findById(userId);
      if (!user || !['student', 'alumni'].includes(user.role)) {
        return false;
      }

      const engagementField = user.role === 'student' ? 'studentEngagement' : 'alumniEngagement';
      
      await User.findByIdAndUpdate(userId, {
        $inc: { [`${engagementField}.eventsRegistered`]: 1 },
        $set: { [`${engagementField}.lastEngagementDate`]: new Date() }
      });

      await logAdminAction({
        admin: { id: userId, username: 'system' },
        action: `${user.role}_engagement_event_registered`,
        targetResource: 'user',
        targetId: userId,
        details: {
          metric: 'eventsRegistered',
          eventId: eventId,
          role: user.role,
          newCount: user[engagementField].eventsRegistered + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing event registration:', error);
      return false;
    }
  }

  /**
   * Decrement event registration when user unregisters
   * @param {String} userId - User ID
   * @param {String} eventId - Event ID
   */
  static async decrementEventRegistration(userId, eventId) {
    try {
      const user = await User.findById(userId);
      if (!user || !['student', 'alumni'].includes(user.role)) {
        return false;
      }

      const engagementField = user.role === 'student' ? 'studentEngagement' : 'alumniEngagement';
      
      if (user[engagementField].eventsRegistered <= 0) {
        return false;
      }

      await User.findByIdAndUpdate(userId, {
        $inc: { [`${engagementField}.eventsRegistered`]: -1 },
        $set: { [`${engagementField}.lastEngagementDate`]: new Date() }
      });

      await logAdminAction({
        admin: { id: userId, username: 'system' },
        action: `${user.role}_engagement_event_unregistered`,
        targetResource: 'user',
        targetId: userId,
        details: {
          metric: 'eventsRegistered',
          eventId: eventId,
          role: user.role,
          newCount: user[engagementField].eventsRegistered - 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error decrementing event registration:', error);
      return false;
    }
  }

  // ============================================
  // STUDENT-SPECIFIC ENGAGEMENT METHODS
  // ============================================

  /**
   * Increment alumni connection count for students
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
      });

      await logAdminAction({
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
      console.error('Error incrementing alumni connection:', error);
      return false;
    }
  }

  /**
   * Increment mentorship request count for students
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
      });

      await logAdminAction({
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
      console.error('Error incrementing mentorship request:', error);
      return false;
    }
  }

  /**
   * Increment active mentorship count for students
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
      });

      await logAdminAction({
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
      console.error('Error incrementing active mentorship:', error);
      return false;
    }
  }

  // ============================================
  // ALUMNI-SPECIFIC ENGAGEMENT METHODS
  // ============================================

  /**
   * Increment mentee count for alumni (when they accept mentorship)
   * @param {String} alumniId - Alumni's user ID
   * @param {String} studentId - Student's user ID
   */
  static async incrementMenteeCount(alumniId, studentId) {
    try {
      const alumni = await User.findById(alumniId);
      if (!alumni || alumni.role !== 'alumni') {
        return false;
      }

      await User.findByIdAndUpdate(alumniId, {
        $inc: { 'alumniEngagement.menteesCount': 1 },
        $set: { 'alumniEngagement.lastEngagementDate': new Date() }
      });

      await logAdminAction({
        admin: { id: alumniId, username: 'system' },
        action: 'alumni_engagement_mentee_added',
        targetResource: 'user',
        targetId: alumniId,
        details: {
          metric: 'menteesCount',
          studentId: studentId,
          newCount: alumni.alumniEngagement.menteesCount + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing mentee count:', error);
      return false;
    }
  }

  /**
   * Increment career advice sessions for alumni
   * @param {String} alumniId - Alumni's user ID
   */
  static async incrementCareerAdviceSessions(alumniId) {
    try {
      const alumni = await User.findById(alumniId);
      if (!alumni || alumni.role !== 'alumni') {
        return false;
      }

      await User.findByIdAndUpdate(alumniId, {
        $inc: { 'alumniEngagement.careerAdviceSessions': 1 },
        $set: { 'alumniEngagement.lastEngagementDate': new Date() }
      });

      await logAdminAction({
        admin: { id: alumniId, username: 'system' },
        action: 'alumni_engagement_career_advice_session',
        targetResource: 'user',
        targetId: alumniId,
        details: {
          metric: 'careerAdviceSessions',
          newCount: alumni.alumniEngagement.careerAdviceSessions + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing career advice sessions:', error);
      return false;
    }
  }

  // ============================================
  // ADMIN-SPECIFIC ENGAGEMENT METHODS
  // ============================================

  /**
   * Track admin event creation
   * @param {String} adminId - Admin's user ID
   * @param {String} eventId - Event ID
   */
  static async incrementEventCreation(adminId, eventId) {
    try {
      const admin = await User.findById(adminId);
      if (!admin || !['admin', 'college_admin'].includes(admin.role)) {
        return false;
      }

      const engagementField = admin.role === 'admin' ? 'systemAdminEngagement' : 'collegeAdminEngagement';
      
      await User.findByIdAndUpdate(adminId, {
        $inc: { [`${engagementField}.eventsCreated`]: 1 },
        $set: { [`${engagementField}.lastEngagementDate`]: new Date() }
      });

      await logAdminAction({
        admin: { id: adminId, username: 'system' },
        action: `${admin.role}_engagement_event_created`,
        targetResource: 'user',
        targetId: adminId,
        details: {
          metric: 'eventsCreated',
          eventId: eventId,
          role: admin.role,
          newCount: admin[engagementField].eventsCreated + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing event creation:', error);
      return false;
    }
  }
  // decrement Event Creation
  /**
   * Decrement event creation count for admins
   * @param {String} adminId - Admin's user ID
   * @param {String} eventId - Event ID
   */
  static async decrementEventCreation(adminId, eventId) {
    try {
      const admin = await User.findById(adminId);
      if (!admin || !['admin', 'college_admin'].includes(admin.role)) {
        return false;
      }

      const engagementField = admin.role === 'admin' ? 'systemAdminEngagement' : 'collegeAdminEngagement';
      
      if (admin[engagementField].eventsCreated <= 0) {
        return false;
      }

      await User.findByIdAndUpdate(adminId, {
        $inc: { [`${engagementField}.eventsCreated`]: -1 },
        $set: { [`${engagementField}.lastEngagementDate`]: new Date() }
      });

      await logAdminAction({
        admin: { id: adminId, username: 'system' },
        action: `${admin.role}_engagement_event_deleted`,
        targetResource: 'user',
        targetId: adminId,
        details: {
          metric: 'eventsCreated',
          eventId: eventId,
          role: admin.role,
          newCount: admin[engagementField].eventsCreated - 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error decrementing event creation:', error);
      return false;
    }
  }

  /**
   * Track admin announcement creation
   * @param {String} adminId - Admin's user ID
   * @param {String} announcementId - Announcement ID
   */
  static async incrementAnnouncementCreation(adminId, announcementId) {
    try {
      const admin = await User.findById(adminId);
      if (!admin || !['admin', 'college_admin'].includes(admin.role)) {
        return false;
      }

      const engagementField = admin.role === 'admin' ? 'systemAdminEngagement' : 'collegeAdminEngagement';
      
      await User.findByIdAndUpdate(adminId, {
        $inc: { [`${engagementField}.announcementsCreated`]: 1 },
        $set: { [`${engagementField}.lastEngagementDate`]: new Date() }
      });

      await logAdminAction({
        admin: { id: adminId, username: 'system' },
        action: `${admin.role}_engagement_announcement_created`,
        targetResource: 'user',
        targetId: adminId,
        details: {
          metric: 'announcementsCreated',
          announcementId: announcementId,
          role: admin.role,
          newCount: admin[engagementField].announcementsCreated + 1
        }
      });

      return true;
    } catch (error) {
      console.error('Error incrementing announcement creation:', error);
      return false;
    }
  }
  

  // ============================================
  // ENGAGEMENT STATISTICS METHODS
  // ============================================

  /**
   * Get engagement statistics based on user role
   * @param {String} userId - User ID
   * @returns {Object} - User engagement data
   */
  static async getEngagementStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      switch (user.role) {
        case 'student':
          return this.getStudentEngagementStats(user);
        case 'alumni':
          return this.getAlumniEngagementStats(user);
        case 'admin':
          return this.getSystemAdminEngagementStats(user);
        case 'college_admin':
          return this.getCollegeAdminEngagementStats(user);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error getting engagement stats:', error);
      return null;
    }
  }

  /**
   * Get student engagement statistics
   * @param {Object} user - User object
   * @returns {Object} - Student engagement data
   */
  static getStudentEngagementStats(user) {
    const engagement = user.studentEngagement || {};
    return {
      postsCreated: engagement.postsCreated || 0,
      alumniConnections: engagement.alumniConnections || 0,
      eventsRegistered: engagement.eventsRegistered || 0,
      eventsAttended: engagement.eventsAttended || 0,
      mentorshipRequests: engagement.mentorshipRequests || 0,
      activeMentorships: engagement.activeMentorships || 0,
      lastEngagementDate: engagement.lastEngagementDate,
      engagementScore: this.calculateStudentEngagementScore(engagement)
    };
  }

  /**
   * Get alumni engagement statistics
   * @param {Object} user - User object
   * @returns {Object} - Alumni engagement data
   */
  static getAlumniEngagementStats(user) {
    const engagement = user.alumniEngagement || {};
    return {
      postsCreated: engagement.postsCreated || 0,
      eventsRegistered: engagement.eventsRegistered || 0,
      eventsAttended: engagement.eventsAttended || 0,
      menteesCount: engagement.menteesCount || 0,
      careerAdviceSessions: engagement.careerAdviceSessions || 0,
      networkingEvents: engagement.networkingEvents || 0,
      lastEngagementDate: engagement.lastEngagementDate,
      engagementScore: this.calculateAlumniEngagementScore(engagement)
    };
  }

  /**
   * Get system admin engagement statistics
   * @param {Object} user - User object
   * @returns {Object} - System admin engagement data
   */
  static getSystemAdminEngagementStats(user) {
    const engagement = user.systemAdminEngagement || {};
    return {
      eventsCreated: engagement.eventsCreated || 0,
      announcementsCreated: engagement.announcementsCreated || 0,
      usersManaged: engagement.usersManaged || 0,
      systemActions: engagement.systemActions || 0,
      lastEngagementDate: engagement.lastEngagementDate,
      engagementScore: this.calculateAdminEngagementScore(engagement)
    };
  }

  /**
   * Get college admin engagement statistics
   * @param {Object} user - User object
   * @returns {Object} - College admin engagement data
   */
  static getCollegeAdminEngagementStats(user) {
    const engagement = user.collegeAdminEngagement || {};
    return {
      eventsCreated: engagement.eventsCreated || 0,
      announcementsCreated: engagement.announcementsCreated || 0,
      collegeUsersManaged: engagement.collegeUsersManaged || 0,
      collegeActions: engagement.collegeActions || 0,
      lastEngagementDate: engagement.lastEngagementDate,
      engagementScore: this.calculateAdminEngagementScore(engagement)
    };
  }

  // ============================================
  // ENGAGEMENT SCORE CALCULATION METHODS
  // ============================================

  /**
   * Calculate student engagement score
   * @param {Object} engagement - Student engagement object
   * @returns {Number} - Engagement score (0-100)
   */
  static calculateStudentEngagementScore(engagement) {
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
    Object.keys(weights).forEach(key => {
      score += (engagement[key] || 0) * weights[key];
    });

    return Math.min(score, 100);
  }

  /**
   * Calculate alumni engagement score
   * @param {Object} engagement - Alumni engagement object
   * @returns {Number} - Engagement score (0-100)
   */
  static calculateAlumniEngagementScore(engagement) {
    if (!engagement) return 0;

    const weights = {
      postsCreated: 2,
      eventsRegistered: 3,
      eventsAttended: 4,
      menteesCount: 10,
      careerAdviceSessions: 6,
      networkingEvents: 5
    };

    let score = 0;
    Object.keys(weights).forEach(key => {
      score += (engagement[key] || 0) * weights[key];
    });

    return Math.min(score, 100);
  }

  /**
   * Calculate admin engagement score
   * @param {Object} engagement - Admin engagement object
   * @returns {Number} - Engagement score (0-100)
   */
  static calculateAdminEngagementScore(engagement) {
    if (!engagement) return 0;

    const weights = {
      eventsCreated: 5,
      announcementsCreated: 4,
      usersManaged: 3,
      systemActions: 2,
      collegeUsersManaged: 3,
      collegeActions: 2
    };

    let score = 0;
    Object.keys(weights).forEach(key => {
      score += (engagement[key] || 0) * weights[key];
    });

    return Math.min(score, 100);
  }
}

module.exports = EngagementTracker;