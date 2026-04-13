import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/groups" className="navbar-brand">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="13" fill="#1a7a5e" />
            <path d="M7 13h12M13 7v12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span>SplitEase</span>
        </Link>

        <div className="navbar-links">
          <Link to="/groups" className={location.pathname.startsWith('/groups') ? 'active' : ''}>
            Groups
          </Link>
        </div>

        <div className="navbar-user">
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{initials}</div>
          <span className="navbar-username">{user?.name}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
