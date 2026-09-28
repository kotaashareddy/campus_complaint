const mongoose = require("mongoose");

//===================== User Schema ========================
const userSchema = new mongoose.Schema({
  name: { type: String, required: 'Name is required' },
  email: { type: String, required: 'Email is required', unique: true },
  password: { type: String, required: 'Password is required' },
  userType: {
    type: String,
    required: 'UserType is required',
    enum: ['Admin', 'Agent', 'Ordinary'],
  },
  department: { type: String }, // For Agents / Department Handlers (Hostel, Mess, Academics, Infrastructure, IT, Library, Transport, Safety)
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

//================== Complaint Schema =================
const complaintSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true, sparse: true }, // Format: CMP-YEAR-0001
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  isAnonymous: { type: Boolean, default: false },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { 
    type: String, 
    required: true,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  // Legacy fields retained as optional for backwards compatibility
  name: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: Number },
  comment: { type: String },
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);

//================== Assigned Complaint Schema =====================

const assignedComplaintSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  complaintId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Complaint" },
  status: { 
    type: String, 
    required: true,
    enum: ['Assigned', 'In Progress', 'Completed'],
    default: 'Assigned'
  },
  agentName: { type: String, required: true },
}, { timestamps: true });

const AssignedComplaint = mongoose.model("AssignedComplaint", assignedComplaintSchema);

//--------------Message Schema ---------------
const messageSchema = new mongoose.Schema({
  name: { type: String, required: 'Name is required' },
  message: { type: String, required: 'Message is required' },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

//============== Export All Models ================
module.exports = {
  User,
  Complaint,
  AssignedComplaint,
  Message,
};
