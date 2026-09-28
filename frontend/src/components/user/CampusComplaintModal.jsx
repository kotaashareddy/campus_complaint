import React, { useState } from 'react';
import {
  X, ArrowLeft, Home, Utensils, GraduationCap, Building,
  Wifi, BookOpen, Bus, ShieldAlert, HelpCircle, Upload, AlertCircle
} from 'lucide-react';
import { CATEGORIES_CONFIG, PRIORITY_OPTIONS } from '../../config/categoriesConfig';

// Map icon names to Lucide icons
const ICON_MAP = {
  Home: Home,
  Utensils: Utensils,
  GraduationCap: GraduationCap,
  Building: Building,
  Wifi: Wifi,
  BookOpen: BookOpen,
  Bus: Bus,
  ShieldAlert: ShieldAlert,
  HelpCircle: HelpCircle,
};

const CampusComplaintModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [details, setDetails] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setSelectedCategory(null);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setIsAnonymous(false);
    setDetails({});
    setPhotoPreview(null);
    setErrors({});
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDetails({});
    setErrors({});
    setStep(2);
  };

  const handleDetailChange = (fieldName, value) => {
    setDetails(prev => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    if (selectedCategory && selectedCategory.fields) {
      selectedCategory.fields.forEach(field => {
        if (field.required && (!details[field.name] || !String(details[field.name]).trim())) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    const payload = {
      userId: user?._id,
      category: selectedCategory.label,
      title,
      description,
      priority,
      isAnonymous,
      details,
    };

    try {
      const response = await fetch('http://localhost:8000/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.complaint || data);
        handleCloseModal();
      } else {
        alert(`Error: ${data.message || data.error || 'Failed to submit complaint'}`);
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          {step === 2 ? (
            <button style={styles.backBtn} onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back to Categories
            </button>
          ) : (
            <h3 style={{ margin: 0, color: 'var(--maroon)', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
              Select Complaint Category
            </h3>
          )}
          <button style={styles.closeBtn} onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Category Cards Grid */}
        {step === 1 && (
          <div style={styles.stepOneContent}>
            <p style={{ color: 'var(--ink-muted)', marginTop: 0, marginBottom: '14px', fontSize: '0.9rem' }}>
              Choose the category that best describes your campus issue:
            </p>
            <div style={styles.categoryGrid}>
              {CATEGORIES_CONFIG.map(cat => {
                const IconComponent = ICON_MAP[cat.iconName] || HelpCircle;
                return (
                  <div
                    key={cat.id}
                    style={styles.categoryCard}
                    className="category-card-custom"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <div className="category-icon-circle">
                      <IconComponent size={20} color="var(--maroon)" />
                    </div>
                    <h4 style={styles.categoryTitle}>{cat.label}</h4>
                    <p style={styles.categoryDesc}>{cat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Category-Specific Dynamic Form */}
        {step === 2 && selectedCategory && (
          <form style={styles.stepTwoForm} onSubmit={handleSubmit}>
            <div style={styles.categoryBadgeHeader}>
              <h3 style={{ margin: 0, color: 'var(--maroon)', fontFamily: 'var(--font-serif)' }}>
                {selectedCategory.label} Complaint
              </h3>
              <span style={styles.deptBadge}>Department: {selectedCategory.department}</span>
            </div>

            {/* Common Fields */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Complaint Title *</label>
              <input
                type="text"
                placeholder="Brief summary of the issue"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                }}
                style={{
                  ...styles.input,
                  borderColor: errors.title ? 'var(--red)' : 'var(--border-color)'
                }}
              />
              {errors.title && <span style={styles.errorText}><AlertCircle size={12} /> {errors.title}</span>}
            </div>

            <div style={styles.rowTwo}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Priority Level *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={styles.select}
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
              </div>

              {selectedCategory.allowAnonymous && (
                <div style={{ ...styles.formGroup, justifyContent: 'center' }}>
                  <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ color: 'var(--ink)' }}>Submit Anonymously</span>
                  </label>
                </div>
              )}
            </div>

            {/* Category-Specific Dynamic Fields */}
            {selectedCategory.fields && selectedCategory.fields.length > 0 && (
              <div style={styles.dynamicSection}>
                <h4 style={styles.sectionHeader}>Category Details</h4>
                <div style={styles.dynamicGrid}>
                  {selectedCategory.fields.map(field => (
                    <div key={field.name} style={styles.formGroup}>
                      <label style={styles.label}>
                        {field.label} {field.required && '*'}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={details[field.name] || ''}
                          onChange={(e) => handleDetailChange(field.name, e.target.value)}
                          style={{
                            ...styles.select,
                            borderColor: errors[field.name] ? 'var(--red)' : 'var(--border-color)'
                          }}
                        >
                          <option value="">-- Select {field.label} --</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          placeholder={field.placeholder || ''}
                          value={details[field.name] || ''}
                          onChange={(e) => handleDetailChange(field.name, e.target.value)}
                          style={{
                            ...styles.input,
                            borderColor: errors[field.name] ? 'var(--red)' : 'var(--border-color)'
                          }}
                        />
                      )}
                      {errors[field.name] && (
                        <span style={styles.errorText}><AlertCircle size={12} /> {errors[field.name]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Full Description *</label>
              <textarea
                rows="4"
                placeholder="Provide detailed description of the issue..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                }}
                style={{
                  ...styles.textarea,
                  borderColor: errors.description ? 'var(--red)' : 'var(--border-color)'
                }}
              />
              {errors.description && <span style={styles.errorText}><AlertCircle size={12} /> {errors.description}</span>}
            </div>

            {/* Optional Photo Attachment */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Photo Evidence (Optional)</label>
              <div style={styles.uploadBox}>
                <Upload size={18} color="var(--ink-muted)" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ cursor: 'pointer' }} />
              </div>
              {photoPreview && (
                <div style={{ marginTop: '10px' }}>
                  <img src={photoPreview} alt="Preview" style={{ height: '80px', borderRadius: 'var(--radius)', border: '1px solid var(--maroon)' }} />
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.cancelBtn} onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    color: 'var(--ink)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-color)',
    width: '100%',
    maxWidth: '750px',
    maxHeight: '92vh',
    overflowY: 'auto',
    padding: '22px 24px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--maroon)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--ink-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  stepOneContent: {
    padding: '0'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '12px'
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '14px 14px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryTitle: {
    margin: '0 0 4px 0',
    color: 'var(--maroon)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-serif)',
    fontWeight: 700
  },
  categoryDesc: {
    margin: 0,
    color: 'var(--ink-muted)',
    fontSize: '0.78rem',
    lineHeight: '1.35',
    fontFamily: 'var(--font-sans)'
  },
  categoryBadgeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  deptBadge: {
    backgroundColor: 'var(--rose-tint)',
    color: 'var(--maroon)',
    padding: '3px 10px',
    borderRadius: 'var(--radius)',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    fontFamily: 'var(--font-sans)'
  },
  stepTwoForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '0.82rem',
    color: 'var(--ink)',
    fontWeight: '600',
    fontFamily: 'var(--font-sans)'
  },
  input: {
    backgroundColor: '#ffffff',
    color: 'var(--ink)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '8px 10px',
    fontSize: '0.9rem'
  },
  select: {
    backgroundColor: '#ffffff',
    color: 'var(--ink)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '8px 10px',
    fontSize: '0.9rem'
  },
  textarea: {
    backgroundColor: '#ffffff',
    color: 'var(--ink)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '8px 10px',
    fontSize: '0.9rem',
    resize: 'vertical'
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  dynamicSection: {
    backgroundColor: 'var(--paper)',
    padding: '12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-color)'
  },
  sectionHeader: {
    margin: '0 0 10px 0',
    fontSize: '0.85rem',
    color: 'var(--maroon)',
    fontFamily: 'var(--font-serif)'
  },
  dynamicGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  errorText: {
    color: 'var(--red)',
    fontSize: '0.78rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  uploadBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--radius)',
    padding: '8px 10px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid var(--border-color)'
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    color: 'var(--ink)',
    border: '1px solid var(--border-color)',
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.88rem'
  },
  submitBtn: {
    backgroundColor: 'var(--maroon)',
    color: '#ffffff',
    border: 'none',
    padding: '8px 20px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.88rem'
  }
};

export default CampusComplaintModal;
