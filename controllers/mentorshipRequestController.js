const mentorshipRequest = require("../models/MentorshipRequestSchema")

exports.createNewRequest = async (req, res)=>{
 
    try{
        const request = await mentorshipRequest.create(req.body);
        return res.status(201).json({
            message: "Mentorship request created successfully",
            mentorshipRequest: request
        });
    }
    catch(err){
        return res.status(500).json({ message: "Error creating mentorship request", error: err.message });
    }
    
}

// get all mentorship request
exports.getAllMentorshipRequests = async (req, res) => {
    try {
        const requests = await mentorshipRequest.find();
        return res.status(200).json({
            message: "Mentorship requests retrieved successfully",
            data: requests
        });
    } catch (err) {
        return res.status(500).json({ message: "Error retrieving mentorship requests", error: err.message });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
  
      // Validate status input
      if (!['approved', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'declined'." });
      }
  
      // Find the request
      const request = await mentorshipRequest.findById(requestId);
  
      // Check if it exists
      if (!request) {
        return res.status(404).json({ message: "Mentorship request not found" });
      }
  
      // Only allow update if current status is 'pending'
      if (request.status !== 'pending') {
        return res.status(400).json({ message: "Request has already been processed" });
      }
  
      // Update the request status
      request.status = status;
      request.updatedAt = new Date();
      await request.save();
  
      return res.status(200).json({
        message: `Mentorship request ${status} successfully.`,
        data: request
      });
    } catch (err) {
      return res.status(500).json({
        message: "Error updating mentorship request status",
        error: err.message
      });
    }
  };

  exports.deleteRequest = async (req, res) => { 
    const { id } = req.params;
    const mentorshipRequest = await mentorshipRequest.findById(id)

    if (!mentorshipRequest) {
        return res.status(404).json({ message: "Mentorship Request not found" });
    }

    await mentorshipRequest.findByIdAndDelete(id);
    return res.status(200).json({ message: "Mentorship Request deleted successfully" });
}

