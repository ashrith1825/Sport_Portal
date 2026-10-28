import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import {
  FiHome, FiCalendar, FiBookOpen, FiLogOut, FiUser, FiShield, FiMenu, FiX, FiUserPlus, FiLogIn, FiUsers,
} from 'react-icons/fi';
import { useState } from 'react';
import ThemeToggle from '../ThemeToggle';
import './Navbar.css';
import logoSrc from '../../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const basePublicLinks = [
    { to: '/events', icon: <FiCalendar />, label: 'Events' },
    { to: '/clubs', icon: <FiShield />, label: 'Clubs' },
    { to: '/teams', icon: <FiUsers />, label: 'Teams' },
    { to: '/journals', icon: <FiBookOpen />, label: 'Journals' },
  ];

  // Show `Home` only for guests. When logged in, provide Dashboard via privateLinks.
  const publicLinks = user ? basePublicLinks : [{ to: '/', icon: <FiHome />, label: 'Home' }, ...basePublicLinks];

  const privateLinks = user ? [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/friends', icon: <FiUserPlus />, label: 'Friends' },
  ] : [];

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-brand">
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          <img src={logoSrc} alt="SportPortal" className="navbar-logo-img" />
          <span className="logo-text">Sport Portal</span>
        </Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {[...publicLinks, ...privateLinks].map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={`navbar-user ${menuOpen ? 'open' : ''}`}>
        <ThemeToggle />
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
