import React, { useEffect, useState } from 'react';
import FooterC from '../common/FooterC';
import Navbar from '../common/Navbar';
import ChatWindow from '../common/ChatWindow';
import { Tag, Shield, MessageSquare, Trash2 } from 'lucide-react';

const Status = () => {
  const [complaints, setComplaints] = useState([]);
  const [openChats, setOpenChats] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch(`http://localhost:8000/complaints/${user._id}`);
        const data = await res.json();
        setComplaints(data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
      }
    };

    if (user?._id) fetchComplaints();
  }, [user]);

  const handleDelete = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      const response = await fetch(`http://localhost:8000/complaints/${complaintId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete complaint');
      }
      setComplaints(prev => prev.filter(c => c._id !== complaintId));
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Failed to delete complaint');
    }
  };

  const toggleChat = (complaintId) => {
    setOpenChats((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  return (
    <div style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Navbar */}
      <Navbar />

      {/* Main Content */}
      <div style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%', flex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '24px' }}>
          Your complaint status
        </h2>

        {complaints.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)' }}>No complaints submitted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((c) => {
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
                        <Tag size={12} style={{ marginRight: '4px' }} /> {c.category || 'General'}
                      </span>
                      <span className={`chip chip-priority-${priorityLower}`}>
                        Priority: {c.priority || 'Medium'}
                      </span>
                      {c.isAnonymous && (
                        <span className="chip" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>
                          <Shield size={12} style={{ marginRight: '4px' }} /> Anonymous
                        </span>
                      )}
                    </div>

                    <span className={`status-text-${statusClass}`}>
                      {c.status}
                    </span>
                  </div>

                  {/* Title & Description */}
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

                  {/* Bottom Action Bar */}
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <span className="submitted-date">
                      Submitted {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn-primary-maroon"
                        onClick={() => toggleChat(c._id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                      >
                        <MessageSquare size={14} />
                        {openChats[c._id] ? 'Close Chat' : 'Chat with Handler'}
                      </button>

                      <button
                        className="btn-secondary-maroon"
                        onClick={() => handleDelete(c._id)}
                        style={{ color: 'var(--red)', borderColor: 'var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {openChats[c._id] && (
                    <div style={{ marginTop: '12px' }}>
                      <ChatWindow
                        complaintId={c._id}
                        onClose={() => toggleChat(c._id)}
                        user={user}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FooterC />
    </div>
  );
};

export default Status;
