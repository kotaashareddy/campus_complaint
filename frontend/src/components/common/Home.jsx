import React from 'react';
import { useNavigate } from 'react-router-dom';
import FooterC from '../common/FooterC';
import heroImage from '../../images/Image1.png'; 

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home-wrapper">
      <header className="header">
        <div className="brand">ComplaintCare</div>
        <nav>
          <ul>
            <li><a href="/" className="active">Home</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Signup</a></li>
          </ul>
        </nav>
      </header>
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-image">
            <img src={heroImage} alt="Campus Complaint Management" />
          </div>
          <div className="hero-text">
            <h1>Empower Your Campus</h1>
            <p>Streamline campus complaints, resolve issues efficiently, and enhance student life.</p>
            <div className="hero-buttons">
              <button onClick={() => handleNavigation('/login')} className="btn-primary-maroon">Register Complaint</button>
              <button onClick={() => handleNavigation('/signup')} className="btn-secondary-maroon">Get Started</button>
            </div>
          </div>
        </div>
      </main>
      <FooterC />
      <style>{`
        .hero-section {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
          background: var(--paper);
          min-height: 68vh;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 40px;
          max-width: 1100px;
          width: 100%;
        }

        .hero-image img {
          width: 100%;
          max-width: 480px;
          border-radius: var(--radius);
          border: 1px solid var(--border-color);
        }

        .hero-text {
          text-align: left;
        }

        .hero-text h1 {
          font-family: var(--font-serif);
          font-size: 2.6rem;
          margin-bottom: 16px;
          color: var(--maroon);
        }

        .hero-text p {
          font-family: var(--font-sans);
          font-size: 1.1rem;
          margin-bottom: 28px;
          color: var(--ink);
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-text {
            text-align: center;
          }

          .hero-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
