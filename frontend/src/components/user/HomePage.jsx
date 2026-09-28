import React, { useState, useEffect } from 'react';
import { Tag, Shield, Check } from 'lucide-react';
import FooterC from '../common/FooterC';
import Navbar from '../common/Navbar';
import CampusComplaintModal from './CampusComplaintModal';

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student' };
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('All'); // 'All', 'Pending', 'In progress', 'Resolved'
  const [userComplaints, setUserComplaints] = useState([]);
  const [submittedSuccessData, setSubmittedSuccessData] = useState(null);

  const fetchComplaints = async () => {
    if (user?._id) {
      try {
        const res = await fetch(`http://localhost:8000/complaints/${user._id}`);
        const data = await res.json();
        setUserComplaints(data);
      } catch (err) {
        console.error('Error loading complaints:', err);
      }
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleComplaintSuccess = (newComplaintData) => {
    setSubmittedSuccessData(newComplaintData);
    fetchComplaints();
  };

  // Subtitle calculation
  const total = userComplaints.length;
  const needAttentionCount = userComplaints.filter(
    c => c.status === 'Pending' || c.status === 'In Progress'
  ).length;

  let subtitleText = '';
  if (total === 0) {
    subtitleText = "You haven't filed any complaints yet.";
  } else if (needAttentionCount === 0) {
    subtitleText = "All caught up. Nothing needs attention.";
  } else {
    subtitleText = `${needAttentionCount} of ${total} complaints still need attention.`;
  }

  // Full-list live counts for tabs
  const countAll = total;
  const countPending = userComplaints.filter(c => c.status === 'Pending').length;
  const countInProgress = userComplaints.filter(c => c.status === 'In Progress').length;
  const countResolved = userComplaints.filter(c => c.status === 'Resolved').length;

  // Filtered list based on both active tab and search text
  const filteredComplaints = userComplaints.filter(c => {
    // Status tab filter
    if (statusTab === 'Pending' && c.status !== 'Pending') return false;
    if (statusTab === 'In progress' && c.status !== 'In Progress') return false;
    if (statusTab === 'Resolved' && c.status !== 'Resolved') return false;

    // Search query filter (trackingID, category, title)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTracking = c.trackingId?.toLowerCase().includes(q);
      const matchTitle = (c.title || c.comment)?.toLowerCase().includes(q);
      const matchCategory = c.category?.toLowerCase().includes(q);
      return matchTracking || matchTitle || matchCategory;
    }

    return true;
  });

  return (
    <div className="homepage-container" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Navbar */}
      <Navbar onAddComplaint={() => setShowFormModal(true)} />

      {/* Main Content Area */}
      <main className="homepage-main" style={{ padding: '32px 20px', maxWidth: '1100px', margin: '0 auto', flex: 1, width: '100%' }}>
        
        {/* HEADER ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--ink)', margin: 0, fontWeight: 700 }}>
              My complaints
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '6px 0 0 0', fontFamily: 'var(--font-sans)' }}>
              {subtitleText}
            </p>
          </div>

          <button
            className="btn-primary-maroon"
            onClick={() => setShowFormModal(true)}
            style={{ borderRadius: '4px', padding: '10px 20px', fontWeight: 700, fontSize: '0.95rem' }}
          >
            Add complaint
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="tabs-container">
          <button
            className={`text-tab ${statusTab === 'All' ? 'active' : ''}`}
            onClick={() => setStatusTab('All')}
          >
            All <span className="tab-count">{countAll}</span>
          </button>
          <button
            className={`text-tab ${statusTab === 'Pending' ? 'active' : ''}`}
            onClick={() => setStatusTab('Pending')}
          >
            Pending <span className="tab-count">{countPending}</span>
          </button>
          <button
            className={`text-tab ${statusTab === 'In progress' ? 'active' : ''}`}
            onClick={() => setStatusTab('In progress')}
          >
            In progress <span className="tab-count">{countInProgress}</span>
          </button>
          <button
            className={`text-tab ${statusTab === 'Resolved' ? 'active' : ''}`}
            onClick={() => setStatusTab('Resolved')}
          >
            Resolved <span className="tab-count">{countResolved}</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="dashboard-search-bar">
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search by tracking ID, category or title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* COMPLAINT LIST */}
        <div>
          {filteredComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '48px 0', fontSize: '0.95rem', fontFamily: 'var(--font-sans)' }}>
              No complaints found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredComplaints.map((c) => {
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

                    {/* Bottom Submitted Date */}
                    <div className="submitted-date">
                      Submitted {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Two-Step Complaint Modal */}
      <CampusComplaintModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        user={user}
        onSuccess={handleComplaintSuccess}
      />

      {/* Success Tracking ID Modal */}
      {submittedSuccessData && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.card}>
            <div style={modalStyles.iconCircle}>
              <Check size={30} color="var(--green)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--maroon)', marginTop: '14px', marginBottom: '8px' }}>
              Complaint Submitted!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
              Your complaint has been successfully registered on campus.
            </p>
            
            <div style={modalStyles.trackingBox}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                YOUR UNIQUE TRACKING ID
              </p>
              <h2 style={{ margin: '6px 0', color: 'var(--maroon)', fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>
                {submittedSuccessData.trackingId || submittedSuccessData._id}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink)' }}>
                Category: <strong>{submittedSuccessData.category}</strong>
              </p>
            </div>

            <button
              className="btn-primary-maroon"
              style={{ width: '100%' }}
              onClick={() => setSubmittedSuccessData(null)}
            >
              Done & View Complaints
            </button>
          </div>
        </div>
      )}

      <FooterC />
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '20px'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '28px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    color: 'var(--ink)'
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--green-tint)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  trackingBox: {
    backgroundColor: 'var(--rose-tint)',
    border: '1px dashed var(--rose-border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    margin: '20px 0'
  }
};

export default HomePage;
