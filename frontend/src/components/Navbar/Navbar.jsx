import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import {
  FiHome, FiCalendar, FiUsers, FiBookOpen, FiLogOut, FiUser, FiShield, FiMenu, FiX, FiUserPlus, FiLogIn,
} from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHomeRoute = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  const basePublicLinks = [
    { to: '/events', icon: <FiCalendar />, label: 'Events' },
    { to: '/clubs', icon: <FiShield />, label: 'Clubs' },
    { to: '/teams', icon: <FiUsers />, label: 'Teams' },
    { to: '/journals', icon: <FiBookOpen />, label: 'Journals' },
  ];

  // Show `Home` only for guests. When logged in, provide Dashboard via privateLinks.
  const publicLinks = user ? basePublicLinks : [{ to: '/', icon: <FiHome />, label: 'Home' }, ...basePublicLinks];

  const isActive = (path) => isHomeRoute(path);

  const privateLinks = user ? [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/friends', icon: <FiUserPlus />, label: 'Friends' },
  ] : [];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          <span className="logo-text">Sport Portal</span>
        </Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {[...publicLinks, ...privateLinks].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className={`navbar-user ${menuOpen ? 'open' : ''}`}>
        {user && (
          <>
            <Link to="/profile" className="nav-link user-link" onClick={() => setMenuOpen(false)}>
              <FiUser />
              <span>{user.username}</span>
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut />
              <span>Logout</span>
            </button>
          </>
        )}
        {!user && (
          <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
            <FiLogIn />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
