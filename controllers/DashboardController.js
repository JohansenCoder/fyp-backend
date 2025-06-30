const DynamicEvent = require('../models/DynamicEventSchema');
const User = require('../models/UserSchema');
const EngagementTracker = require('../utils/engagement');
const MentorshipRequest = require('../models/MentorshipRequestSchema');
const Announcement = require('../models/AnnouncementSchema');

/**
 * Get comprehensive dashboard data for a user
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Base dashboard data for all users
    const dashboardData = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        college: user.college,
        department: user.department
      },
      engagement: await EngagementTracker.getEngagementStats(userId),
      timestamp: new Date().toISOString()
    };

    // Role-specific dashboard data
    switch (user.role) {
      case 'student':
        dashboardData.student = await getStudentDashboardData(userId);
        break;
      case 'alumni':
        dashboardData.alumni = await getAlumniDashboardData(userId);
        break;
      case 'admin':
        dashboardData.admin = await getAdminDashboardData(userId);
        break;
      case 'college_admin':
        dashboardData.collegeAdmin = await getCollegeAdminDashboardData(userId, user.college);
        break;
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get student-specific dashboard data
 */
async function getStudentDashboardData(userId) {
  try {
    // Get registered events
    const registeredEvents = await DynamicEvent.find({
      Attendees: userId,
      status: 'active'
    }).select('title description startDate endDate location category media').limit(10);

    // Get upcoming events (not registered)
    const upcomingEvents = await DynamicEvent.find({
      Attendees: { $ne: userId },
      status: 'active',
      startDate: { $gte: new Date() }
    }).select('title description startDate endDate location category media').limit(5);

    // Get mentorship requests
    const mentorshipRequests = await MentorshipRequest.find({
      student: userId
    }).populate('mentor', 'profile.firstName profile.lastName profile.bio college department')
      .select('status createdAt message')
      .limit(5);

    // Get recent announcements
    const recentAnnouncements = await Announcement.find({
      targetAudience: { $in: ['students', 'all'] }
    }).select('title content createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      events: {
        registered: registeredEvents,
        upcoming: upcomingEvents,
        registeredCount: registeredEvents.length
      },
      mentorship: {
        requests: mentorshipRequests,
        activeCount: mentorshipRequests.filter(req => req.status === 'accepted').length,
        pendingCount: mentorshipRequests.filter(req => req.status === 'pending').length
      },
      announcements: recentAnnouncements
    };
  } catch (error) {
    console.error('Student dashboard data error:', error);
    return {};
  }
}

/**
 * Get alumni-specific dashboard data
 */
async function getAlumniDashboardData(userId) {
  try {
    // Get events they're attending
    const registeredEvents = await DynamicEvent.find({
      Attendees: userId,
      status: 'active'
    }).select('title description startDate endDate location category media').limit(10);

    // Get mentorship requests they received
    const mentorshipRequests = await MentorshipRequest.find({
      mentor: userId
    }).populate('student', 'profile.firstName profile.lastName college department')
      .select('status createdAt message')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get their mentees count
    const menteeCount = mentorshipRequests.filter(req => req.status === 'accepted').length;

    // Get recent announcements
    const recentAnnouncements = await Announcement.find({
      targetAudience: { $in: ['alumni', 'all'] }
    }).select('title content createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      events: {
        registered: registeredEvents,
        registeredCount: registeredEvents.length
      },
      mentorship: {
        requests: mentorshipRequests,
        menteeCount: menteeCount,
        pendingRequests: mentorshipRequests.filter(req => req.status === 'pending').length
      },
      announcements: recentAnnouncements
    };
  } catch (error) {
    console.error('Alumni dashboard data error:', error);
    return {};
  }
}

/**
 * Get admin-specific dashboard data
 */
async function getAdminDashboardData(userId) {
  try {
    // Get events they created
    const createdEvents = await DynamicEvent.find({
      createdBy: userId
    }).select('title description startDate status Attendees').limit(10);

    // Get overall statistics
    const stats = {
      totalEvents: await DynamicEvent.countDocuments(),
      activeEvents: await DynamicEvent.countDocuments({ status: 'active' }),
      totalUsers: await User.countDocuments(),
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalAlumni: await User.countDocuments({ role: 'alumni' }),
      totalMentorshipRequests: await MentorshipRequest.countDocuments()
    };

    // Get recent mentorship requests
    const recentMentorshipRequests = await MentorshipRequest.find()
      .populate('student', 'profile.firstName profile.lastName college')
      .populate('mentor', 'profile.firstName profile.lastName college')
      .select('status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      events: {
        created: createdEvents,
        createdCount: createdEvents.length
      },
      statistics: stats,
      mentorship: {
        recentRequests: recentMentorshipRequests,
        totalRequests: recentMentorshipRequests.length
      }
    };
  } catch (error) {
    console.error('Admin dashboard data error:', error);
    return {};
  }
}

/**
 * Get college admin-specific dashboard data
 */
async function getCollegeAdminDashboardData(userId, college) {
  try {
    // Get events they created
    const createdEvents = await DynamicEvent.find({
      createdBy: userId,
      college: { $in: [college] }
    }).select('title description startDate status Attendees').limit(10);

    // Get college-specific statistics
    const stats = {
      collegeEvents: await DynamicEvent.countDocuments({ college: { $in: [college] } }),
      collegeActiveEvents: await DynamicEvent.countDocuments({ 
        college: { $in: [college] }, 
        status: 'active' 
      }),
      collegeStudents: await User.countDocuments({ role: 'student', college: college }),
      collegeAlumni: await User.countDocuments({ role: 'alumni', college: college })
    };

    // Get college-specific mentorship requests
    const collegeMentorshipRequests = await MentorshipRequest.find({
      $or: [
        { 'student.college': college },
        { 'mentor.college': college }
      ]
    }).populate('student', 'profile.firstName profile.lastName college')
      .populate('mentor', 'profile.firstName profile.lastName college')
      .select('status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      events: {
        created: createdEvents,
        createdCount: createdEvents.length
      },
      statistics: stats,
      mentorship: {
        collegeRequests: collegeMentorshipRequests,
        totalRequests: collegeMentorshipRequests.length
      }
    };
  } catch (error) {
    console.error('College admin dashboard data error:', error);
    return {};
  }
}

/**
 * Get real-time updates for dashboard
 */
exports.getDashboardUpdates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lastUpdate } = req.query;
    
    const since = lastUpdate ? new Date(lastUpdate) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get new events since last update
    const newEvents = await DynamicEvent.find({
      createdAt: { $gte: since },
      status: 'active'
    }).select('title description startDate category').limit(5);

    // Get new announcements
    const newAnnouncements = await Announcement.find({
      createdAt: { $gte: since }
    }).select('title content createdAt').limit(5);

    // Role-specific updates
    let roleSpecificUpdates = {};
    
    if (req.user.role === 'alumni') {
      roleSpecificUpdates.newMentorshipRequests = await MentorshipRequest.find({
        mentor: userId,
        createdAt: { $gte: since }
      }).populate('student', 'profile.firstName profile.lastName');
    }

    res.json({
      newEvents,
      newAnnouncements,
      roleSpecificUpdates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard updates error:', error);
    res.status(500).json({ message: 'Failed to fetch updates' });
  }
};