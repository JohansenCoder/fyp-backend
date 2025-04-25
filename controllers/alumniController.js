// const alumni = require("../models/AlumniProfileSchema")

// exports.getAllAlumni = async (res, req)=>{
//     try{
//         const emergencyContacts = await alumni.find();
//         res.status(200).json({  
//             message: "Alumni fetched successfully",
//             alumni: alumni
//         });
//     } catch (err) {
//         res.status(500).json({
//             message: "Error fetching alumni",
//             error: err
//         });
//     }
// }

// exports.getAlumniById = async (req, res) =>{
//     const {id} = req.params;
//     const alumni = await alumni.findById(id);
    
//     if (!alumni) { 
//         return res.status(404).json({ message: "Alumni not found" });
//     }
//     res.status(200).json({
//         message: "Alumni fetched successfully",
//         alumni : alumni
//     }); 
// }