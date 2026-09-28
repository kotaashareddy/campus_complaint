import React, { useEffect, useState } from 'react';
import {
  Search, MessageSquare, Tag, Shield, Check
} from 'lucide-react';
import FooterC from '../common/FooterC';
import Navbar from '../common/Navbar';
import ChatWindow from '../common/ChatWindow';
import './AgentHome.css';
import axios from 'axios';

const AgentHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [userName] = useState(user?.name || 'Department Handler');
  const [userDepartment] = useState(user?.department || 'Department');
  const [agentId] = useState(user?._id);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [agentComplaintList, setAgentComplaintList] = useState([]);

  useEffect(() => {
    if (!user || user.userType !== 'Agent') {
      window.location.href = '/';
    } else {
      fetchAssignedComplaints();
    }
  }, []);

  const fetchAssignedComplaints = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/assignedComplaints/${agentId}`);
      setAgentComplaintList(res.data);
    } catch (err) {
      console.error('Failed to fetch assigned complaints', err);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/updateComplaintStatus/${complaintId}`, { status: newStatus });
      setAgentComplaintList(prev =>
        prev.map(complaint =>
          complaint._id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const filteredComplaints = agentComplaintList.filter(complaint => {
    const studentDisplayName = complaint.isAnonymous ? 'Anonymous Student' : (complaint.name || complaint.userId?.name || '');
    const matchSearch =
      studentDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'all' || complaint.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="agent-home" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="agent-main" style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto', flex: 1, width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '24px' }}>
          Department Handler Portal ({userDepartment})
        </h1>
        
        {/* Stat Cards */}
        <div className="agent-stats">
          <div className="stat-card stat-total">
            <p>Total Assigned</p>
            <h2>{agentComplaintList.length}</h2>
          </div>
          <div className="stat-card stat-pending">
            <p>Pending</p>
            <h2>{agentComplaintList.filter(c => c.status === 'Pending').length}</h2>
          </div>
          <div className="stat-card stat-progress">
            <p>In progress</p>
            <h2>{agentComplaintList.filter(c => c.status === 'In Progress').length}</h2>
          </div>
          <div className="stat-card stat-resolved">
            <p>Resolved</p>
            <h2>{agentComplaintList.filter(c => c.status === 'Resolved').length}</h2>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <Search size={16} color="var(--ink-muted)" />
            <input
              type="text"
              placeholder="Search by tracking ID, category or title…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Complaints Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => {
              const statusClass = complaint.status?.toLowerCase().replace(' ', '-');
              const priorityLower = (complaint.priority || 'medium').toLowerCase();
              return (
                <div key={complaint._id} className={`complaint-card status-${statusClass}`}>
                  {/* Top Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="chip chip-tracking">
                        {complaint.trackingId || `ID: ${complaint._id.substring(0, 8)}`}
                      </span>
                      <span className="chip chip-category">
                        <Tag size={12} style={{ marginRight: '4px' }} /> Category: {complaint.category || 'General'}
                      </span>
                      <span className={`chip chip-priority-${priorityLower}`}>
                        Priority: {complaint.priority || 'Medium'}
                      </span>
                      {complaint.isAnonymous ? (
                        <span className="chip" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>
                          <Shield size={12} style={{ marginRight: '4px' }} /> Anonymous Student
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                          Student: <strong>{complaint.name || complaint.userId?.name || 'Student'}</strong>
                        </span>
                      )}
                    </div>

                    <span className={`status-text-${statusClass}`}>
                      {complaint.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="complaint-title">{complaint.title || complaint.comment}</h3>
                  <p className="complaint-description">{complaint.description || complaint.comment}</p>

                  {/* Details Strip */}
                  {complaint.details && Object.keys(complaint.details).length > 0 && (
                    <div className="details-strip">
                      {Object.entries(complaint.details).map(([k, v]) => (
                        <span key={k}>
                          <strong>{k}:</strong> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span className="submitted-date">
                      Submitted {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {complaint.status !== 'Resolved' && (
                        <>
                          <button
                            className="btn-secondary-maroon"
                            onClick={() => handleStatusChange(complaint._id, 'Pending')}
                            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                          >
                            Set Pending
                          </button>

                          <button
                            className="btn-secondary-maroon"
                            onClick={() => handleStatusChange(complaint._id, 'In Progress')}
                            style={{ color: 'var(--blue)', borderColor: 'var(--blue)', fontSize: '0.85rem', padding: '6px 12px' }}
                          >
                            In Progress
                          </button>

                          <button
                            className="btn-primary-maroon"
                            onClick={() => handleStatusChange(complaint._id, 'Resolved')}
                            style={{ backgroundColor: 'var(--green)', fontSize: '0.85rem', padding: '6px 12px' }}
                          >
                            <Check size={14} style={{ marginRight: '4px' }} /> Resolve
                          </button>
                        </>
                      )}
                      <button
                        className="btn-primary-maroon"
                        onClick={() => setSelectedComplaintId(complaint._id)}
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        <MessageSquare size={14} style={{ marginRight: '4px' }} /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '40px 0' }}>
              No complaints assigned to your department at the moment.
            </div>
          )}
        </div>
      </main>

      {selectedComplaintId && (
        <ChatWindow
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          user={user}
        />
      )}
      <FooterC />
    </div>
  );
};

export default AgentHome;
