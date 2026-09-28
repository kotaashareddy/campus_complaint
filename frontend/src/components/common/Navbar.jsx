import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onAddComplaint, activeAdminTab, setActiveAdminTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user')) || null;
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userType = user?.userType || 'Ordinary'; // Ordinary, Agent, Admin
  const initial = userName.charAt(0).toUpperCase();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleMenuClick = (action) => {
    setDropdownOpen(false);
    if (typeof action === 'function') {
      action();
    } else if (typeof action === 'string') {
      navigate(action);
    }
  };

  return (
    <header className="navbar-container">
      <div
        className="navbar-left"
        onClick={() => navigate(user ? (userType === 'Admin' ? '/admin' : userType === 'Agent' ? '/agent' : '/user') : '/')}
        style={{ cursor: 'pointer' }}
      >
        <span className="navbar-brand">ComplaintCare</span>
      </div>

      <div className="navbar-right">
        {/* Nav Links (Home & Status as plain white text with 3px white bottom underline when active) */}
        {userType === 'Ordinary' && (
          <nav className="navbar-links">
            <button
              className={`nav-link-item ${location.pathname === '/user' ? 'active' : ''}`}
              onClick={() => navigate('/user')}
            >
              Home
            </button>
            <button
              className={`nav-link-item ${location.pathname === '/status' ? 'active' : ''}`}
              onClick={() => navigate('/status')}
            >
              Status
            </button>
          </nav>
        )}

        {/* Circular Avatar Button */}
        {user ? (
          <div className="avatar-wrapper" ref={dropdownRef}>
            <button
              className="avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="User Profile Menu"
            >
              {initial}
            </button>

            {/* Profile Dropdown Card */}
            {dropdownOpen && (
              <div className="profile-dropdown">
                {/* Top Section */}
                <div className="dropdown-header">
                  <div className="large-avatar">{initial}</div>
                  <div className="user-name">{userName}</div>
                  {userEmail && <div className="user-email">{userEmail}</div>}
                </div>

                {/* Manage Profile Button */}
                <div className="dropdown-section">
                  <button className="manage-profile-btn" onClick={() => handleMenuClick('/user')}>
                    Manage your profile
                  </button>
                </div>

                <div className="dropdown-divider" />

                {/* Menu Items */}
                <div className="dropdown-menu">
                  {/* Mobile Navigation Links */}
                  <div className="mobile-nav-items">
                    {userType === 'Ordinary' && (
                      <>
                        <div
                          className="menu-item"
                          onClick={() => handleMenuClick('/user')}
                        >
                          Home
                        </div>
                        <div
                          className="menu-item"
                          onClick={() => handleMenuClick('/status')}
                        >
                          Status
                        </div>
                      </>
                    )}
                  </div>

                  {/* Role Specific Items */}
                  {userType === 'Ordinary' && (
                    <>
                      <div
                        className="menu-item"
                        onClick={() => handleMenuClick('/user')}
                      >
                        My complaints
                      </div>
                      <div
                        className="menu-item"
                        onClick={() => handleMenuClick(() => {
                          if (location.pathname !== '/user') {
                            navigate('/user');
                          }
                          if (onAddComplaint) onAddComplaint();
                        })}
                      >
                        Add complaint
                      </div>
                    </>
                  )}

                  {userType === 'Agent' && (
                    <div
                      className="menu-item"
                      onClick={() => handleMenuClick('/agent')}
                    >
                      Assigned complaints
                    </div>
                  )}

                  {userType === 'Admin' && (
                    <>
                      <div
                        className="menu-item"
                        onClick={() => handleMenuClick(() => {
                          if (setActiveAdminTab) setActiveAdminTab('dashboard');
                          navigate('/admin');
                        })}
                      >
                        Dashboard
                      </div>
                      <div
                        className="menu-item"
                        onClick={() => handleMenuClick(() => {
                          if (setActiveAdminTab) setActiveAdminTab('users');
                          navigate('/admin');
                        })}
                      >
                        Manage users
                      </div>
                    </>
                  )}
                </div>

                <div className="dropdown-divider" />

                {/* Logout Row */}
                <div className="dropdown-menu">
                  <div className="menu-item logout-item" onClick={handleLogout}>
                    Log out
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Landing/Login page guest navbar */
          <nav className="navbar-links">
            <button
              className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button
              className={`nav-link-item ${location.pathname === '/login' ? 'active' : ''}`}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className={`nav-link-item ${location.pathname === '/signup' ? 'active' : ''}`}
              onClick={() => navigate('/signup')}
            >
              Signup
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
