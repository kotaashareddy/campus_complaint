const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("./config.js");

const app = express();
const PORT = 8000;

const { User, Complaint, AssignedComplaint, Message } = require("./Schema");

app.use(cors());
app.use(express.json());

// Helper function to map category to department string
const mapCategoryToDepartment = (category) => {
  if (!category) return null;
  const cat = category.toLowerCase();
  if (cat.includes("hostel")) return "Hostel";
  if (cat.includes("mess") || cat.includes("canteen")) return "Mess";
  if (cat.includes("academic")) return "Academics";
  if (cat.includes("infrastructure")) return "Infrastructure";
  if (cat.includes("it") || cat.includes("wifi")) return "IT";
  if (cat.includes("library")) return "Library";
  if (cat.includes("transport") || cat.includes("bus")) return "Transport";
  if (cat.includes("safety") || cat.includes("harassment")) return "Safety";
  return null;
};

// Helper function to generate guaranteed unique trackingId (e.g. CMP-2026-0001)
const generateTrackingId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  let nextNum = count + 1;
  let candidate = `CMP-${currentYear}-${nextNum.toString().padStart(4, '0')}`;

  // Loop until a unique candidate is found
  while (await Complaint.findOne({ trackingId: candidate })) {
    nextNum++;
    candidate = `CMP-${currentYear}-${nextNum.toString().padStart(4, '0')}`;
  }
  return candidate;
};

//----------------- Home ------------------//
app.get("/", (req, res) => {
  res.send("Welcome to ComplaintCare Campus API");
});

//----------------- Signup ------------------//
app.post("/signup", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

//----------------- Login ------------------//
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

//----------------- Create Complaint (Campus Flow + Auto-Routing) ------------------//
app.post("/complaints", async (req, res) => {
  try {
    const { userId, category, title, description, priority, isAnonymous, details } = req.body;

    // Validate or resolve valid userId
    let validUserId = userId;
    let studentName = "Student";

    if (validUserId && mongoose.Types.ObjectId.isValid(validUserId)) {
      const u = await User.findById(validUserId);
      if (u) {
        studentName = u.name;
      } else {
        validUserId = null;
      }
    } else {
      validUserId = null;
    }

    // Fallback user if userId is invalid or missing
    if (!validUserId) {
      let defaultUser = await User.findOne({ email: "student@campus.edu" });
      if (!defaultUser) {
        defaultUser = await User.create({
          name: "Campus Student",
          email: "student@campus.edu",
          password: "123",
          userType: "Ordinary"
        });
      }
      validUserId = defaultUser._id;
      studentName = defaultUser.name;
    }

    const trackingId = await generateTrackingId();

    const newComplaintData = {
      trackingId,
      userId: validUserId,
      category: category || 'General',
      title: title || 'Campus Complaint',
      description: description || title || 'No description provided',
      priority: priority || 'Medium',
      isAnonymous: Boolean(isAnonymous),
      details: details || {},
      status: 'Pending',
      name: studentName,
      comment: description || title
    };

    const complaint = new Complaint(newComplaintData);
    const savedComplaint = await complaint.save();

    // AUTO-ROUTING LOGIC
    let autoAssigned = null;
    const targetDept = mapCategoryToDepartment(category);

    if (targetDept) {
      // Find all department handlers for this department
      const matchingHandlers = await User.find({ userType: "Agent", department: targetDept });

      if (matchingHandlers.length > 0) {
        // Find handler with fewest active complaints
        let bestHandler = null;
        let minActiveCount = Infinity;

        for (const handler of matchingHandlers) {
          const activeCount = await AssignedComplaint.countDocuments({
            agentId: handler._id,
            status: { $in: ['Assigned', 'In Progress'] }
          });

          if (activeCount < minActiveCount) {
            minActiveCount = activeCount;
            bestHandler = handler;
          }
        }

        if (bestHandler) {
          const assignment = new AssignedComplaint({
            agentId: bestHandler._id,
            complaintId: savedComplaint._id,
            status: 'Assigned',
            agentName: bestHandler.name
          });

          await assignment.save();

          savedComplaint.status = 'In Progress';
          await savedComplaint.save();

          autoAssigned = {
            agentId: bestHandler._id,
            agentName: bestHandler.name,
            department: bestHandler.department
          };
        }
      }
    }

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: savedComplaint,
      autoAssigned
    });
  } catch (err) {
    console.error("COMPLAINT CREATION ERROR:", err);
    res.status(500).json({ message: "Failed to save complaint", error: err.message });
  }
});

//----------------- Get Complaints by User ---------------------------//
app.get("/complaints/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    let query = { userId };
    
    // If invalid ObjectId or fallback, find all or match
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const defaultUser = await User.findOne({ email: "student@campus.edu" });
      if (defaultUser) query = { userId: defaultUser._id };
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving complaints", error: err.message });
  }
});

//----------------- Delete Complaint by User ---------------------------//
app.delete("/complaints/:id", async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    await AssignedComplaint.deleteMany({ complaintId: req.params.id });
    await Message.deleteMany({ complaintId: req.params.id });
    res.status(200).json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting complaint", error: err.message });
  }
});

//----------------- Get All Complaints (Admin View) ---------------//
app.get("/status", async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate("userId", "name email").sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving all complaints", error: err.message });
  }
});

//----------------- Get All Agents (Department Handlers) -----------------------//
app.get("/agentUsers", async (req, res) => {
  try {
    const agents = await User.find({ userType: "Agent" });
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving agents", error: err.message });
  }
});

//----------------- Get All Ordinary Users (Students) ------------//
app.get("/OrdinaryUsers", async (req, res) => {
  try {
    const users = await User.find({ userType: "Ordinary" });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving users", error: err.message });
  }
});

//----------------- Delete a User ---------------------------//
app.delete("/OrdinaryUsers/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted", deleted });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

//----------------- Update a User -----------------------//
app.put("/user/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

//----------------- Get Agent by ID -----------------------//
app.get("/agentUsers/:id", async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.userType !== "Agent") {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json(agent);
  } catch (err) {
    res.status(500).json({ message: "Error fetching agent", error: err.message });
  }
});

//----------------- Manual Assign Complaint (Admin) ---------------//
app.post("/assignedComplaints", async (req, res) => {
  try {
    const { agentId, complaintId, agentName } = req.body;

    // Check if already assigned
    let assignment = await AssignedComplaint.findOne({ complaintId });

    if (assignment) {
      assignment.agentId = agentId;
      assignment.agentName = agentName;
      assignment.status = "Assigned";
      await assignment.save();
    } else {
      assignment = new AssignedComplaint({
        agentId,
        complaintId,
        status: "Assigned",
        agentName
      });
      await assignment.save();
    }

    await Complaint.findByIdAndUpdate(complaintId, { status: "In Progress" });

    res.status(201).json({ message: "Complaint assigned", assignment });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed", error: err.message });
  }
});

//----------------- Assigned Complaints for Department Handler --------------------------//
app.get("/assignedComplaints/:agentId", async (req, res) => {
  try {
    const assigned = await AssignedComplaint.find({ agentId: req.params.agentId })
      .populate({
        path: "complaintId",
        populate: { path: "userId", select: "name email" }
      });

    const formatted = assigned
      .filter(entry => entry.complaintId !== null)
      .map(entry => {
        const cObj = entry.complaintId.toObject();
        return {
          ...cObj,
          assignmentId: entry._id,
          agentId: entry.agentId,
          agentName: entry.agentName,
          assignedStatus: entry.status
        };
      });

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assigned complaints", error: err.message });
  }
});

//----------------- Update Complaint Status --------------//
app.put("/updateComplaintStatus/:complaintId", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Complaint.findByIdAndUpdate(
      req.params.complaintId,
      { status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
});

//----------------- Chat: Send Message ------------------
app.post("/messages", async (req, res) => {
  try {
    const { complaintId, name, message } = req.body;
    const newMessage = new Message({ complaintId, name, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
});

//----------------- Chat, Get Messages for Complaint ------------------
app.get("/messages/:complaintId", async (req, res) => {
  try {
    const messages = await Message.find({ complaintId: req.params.complaintId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
