import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FooterC from '../common/FooterC';
import Navbar from '../common/Navbar';
import { Tag, Shield, UserCheck } from 'lucide-react';
import './AdminHome.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState({});
  const [assignedMap, setAssignedMap] = useState({});

  useEffect(() => {
    const fetchAdmin = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userType === "Admin") {
        setUserName(user.name);
      } else {
        navigate('/');
      }
    };
    fetchAdmin();
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const [complaintRes, agentRes, userRes] = await Promise.all([
        axios.get('http://localhost:8000/status'),
        axios.get('http://localhost:8000/agentUsers'),
        axios.get('http://localhost:8000/OrdinaryUsers'),
      ]);
      setComplaints(complaintRes.data);
      setAgents(agentRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const assignComplaint = async (complaintId) => {
    const agentId = selectedAgent[complaintId];
    const agentObj = agents.find(a => a._id === agentId);
    if (!agentId || !agentObj) return alert("Please select a Department Handler");

    try {
      await axios.post('http://localhost:8000/assignedComplaints', {
        agentId,
        complaintId,
        status: "Assigned",
        agentName: agentObj.name
      });

      setAssignedMap(prev => ({
        ...prev,
        [complaintId]: `${agentObj.name} (${agentObj.department || 'General'})`
      }));

      alert(`Assigned complaint to ${agentObj.name}`);
      fetchAllData();
    } catch (err) {
      console.error('Assignment error:', err);
      alert("Failed to assign complaint.");
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Navbar */}
      <Navbar activeAdminTab={activeTab} setActiveAdminTab={setActiveTab} />

      {/* Main Content */}
      <div className="admin-content" style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto', flex: 1, width: '100%' }}>
        {/* Admin Sub Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            className={`btn-secondary-maroon ${activeTab === 'dashboard' ? 'btn-primary-maroon' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            All Complaints
          </button>
          <button
            className={`btn-secondary-maroon ${activeTab === 'users' ? 'btn-primary-maroon' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Students
          </button>
          <button
            className={`btn-secondary-maroon ${activeTab === 'agents' ? 'btn-primary-maroon' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Department Handlers
          </button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '24px' }}>
          {activeTab === 'dashboard' && 'Campus Complaints Dashboard'}
          {activeTab === 'users' && 'Registered Students'}
          {activeTab === 'agents' && 'Department Handlers'}
        </h2>

        {/* Dashboard / All Complaints Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stat Cards */}
            <div className="user-stats" style={{ marginBottom: '24px' }}>
              <div className="stat-card stat-total">
                <p>Total Complaints</p>
                <h2>{complaints.length}</h2>
              </div>
              <div className="stat-card stat-pending">
                <p>Pending</p>
                <h2>{complaints.filter(c => c.status === 'Pending').length}</h2>
              </div>
              <div className="stat-card stat-progress">
                <p>In Progress</p>
                <h2>{complaints.filter(c => c.status === 'In Progress').length}</h2>
              </div>
              <div className="stat-card stat-resolved">
                <p>Resolved</p>
                <h2>{complaints.filter(c => c.status === 'Resolved').length}</h2>
              </div>
            </div>

            {/* Complaints List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {complaints.length > 0 ? (
                complaints.map((c) => {
                  const statusClass = c.status?.toLowerCase().replace(' ', '-');
                  const priorityLower = (c.priority || 'medium').toLowerCase();
                  return (
                    <div key={c._id} className={`complaint-card status-${statusClass}`}>
                      {/* Top Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="chip chip-tracking">
                            {c.trackingId || `ID: ${c._id.substring(0, 8)}`}
                          </span>
                          <span className="chip chip-category">
                            <Tag size={12} style={{ marginRight: '4px' }} /> Category: {c.category || 'General'}
                          </span>
                          <span className={`chip chip-priority-${priorityLower}`}>
                            Priority: {c.priority || 'Medium'}
                          </span>
                          {c.isAnonymous && (
                            <span className="chip" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>
                              <Shield size={12} style={{ marginRight: '4px' }} /> Submitted Anonymously
                            </span>
                          )}
                        </div>

                        <span className={`status-text-${statusClass}`}>
                          {c.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        Student Name: <strong style={{ color: 'var(--ink)' }}>{c.name || c.userId?.name || 'Student'}</strong> {c.isAnonymous && <span style={{ color: '#6b21a8' }}>(Hidden from Handler)</span>}
                      </div>

                      <h3 className="complaint-title">{c.title || c.comment}</h3>
                      <p className="complaint-description">{c.description || c.comment}</p>

                      {/* Details Strip */}
                      {c.details && Object.keys(c.details).length > 0 && (
                        <div className="details-strip">
                          {Object.entries(c.details).map(([key, val]) => (
                            <span key={key}>
                              <strong>{key}:</strong> {String(val)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Manual Assignment Section */}
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <span className="submitted-date">
                          Submitted {new Date(c.createdAt).toLocaleDateString()}
                        </span>

                        <div>
                          {assignedMap[c._id] ? (
                            <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.85rem' }}>
                              <UserCheck size={14} style={{ marginRight: '4px' }} /> Assigned to {assignedMap[c._id]}
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <select
                                value={selectedAgent[c._id] || ''}
                                onChange={(e) => setSelectedAgent({ ...selectedAgent, [c._id]: e.target.value })}
                                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                              >
                                <option value="">-- Select Handler --</option>
                                {agents.map((agent) => (
                                  <option key={agent._id} value={agent._id}>
                                    {agent.name} ({agent.department || 'General'})
                                  </option>
                                ))}
                              </select>

                              <button
                                className="btn-primary-maroon"
                                onClick={() => assignComplaint(c._id)}
                                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                              >
                                Assign
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '40px 0' }}>
                  No complaints found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'users' && (
          <div>
            {users.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u._id}>
                      <td>{idx + 1}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>Student</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--ink-muted)' }}>No students registered.</p>
            )}
          </div>
        )}

        {/* Department Handlers Tab */}
        {activeTab === 'agents' && (
          <div>
            {agents.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Handler Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, idx) => (
                    <tr key={agent._id}>
                      <td>{idx + 1}</td>
                      <td><strong>{agent.name}</strong></td>
                      <td>{agent.email}</td>
                      <td><span className="chip chip-tracking">{agent.department || 'General'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--ink-muted)' }}>No department handlers registered.</p>
            )}
          </div>
        )}
      </div>

      <FooterC />
    </div>
  );
};

export default AdminHome;
