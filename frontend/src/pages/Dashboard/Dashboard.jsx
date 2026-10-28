import { useEffect, useEffectEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import { getUpcomingEvents, getMyClubs, getMyJournals, getFriends } from '../../api/services';
import { FiCalendar, FiShield, FiBookOpen, FiUsers, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: [], clubs: [], journals: [], friends: [] });
  const [loading, setLoading] = useState(true);
  const [dataUnavailable, setDataUnavailable] = useState(false);

  const loadDashboard = useEffectEvent(async () => {
    const [events, clubs, journals, friends] = await Promise.allSettled([
      getUpcomingEvents(), getMyClubs(), getMyJournals(), getFriends(),
    ]);
      setDataUnavailable([events, clubs, journals, friends].some((result) => result.status === 'rejected'));
      setStats({
        events: events.status === 'fulfilled' ? events.value.data : [],
        clubs: clubs.status === 'fulfilled' ? clubs.value.data : [],
        journals: journals.status === 'fulfilled' ? journals.value.data : [],
        friends: friends.status === 'fulfilled' ? friends.value.data.filter(f => f.status === 'ACCEPTED') : [],
      });
      setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
    const handleFocus = () => loadDashboard();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { title: 'Upcoming Events', count: stats.events.length, icon: <FiCalendar />, to: '/events', items: stats.events.slice(0, 3) },
    { title: 'My Clubs', count: stats.clubs.length, icon: <FiShield />, to: '/clubs', items: stats.clubs.slice(0, 3) },
    { title: 'My Journals', count: stats.journals.length, icon: <FiBookOpen />, to: '/journals', items: stats.journals.slice(0, 3) },
    { title: 'Friends', count: stats.friends.length, icon: <FiUsers />, to: '/friends', items: stats.friends.slice(0, 3) },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, <span className="highlight">{user?.firstName || user?.username}</span>!</h1>
        <p>Here's what's happening in your sports world</p>
      </div>
      {dataUnavailable && <p className="page-error" role="status">Some activity data could not be loaded. Refresh to try again.</p>}

      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">{card.icon}</div>
              <span className="stat-count">{card.count}</span>
            </div>
            <h3>{card.title}</h3>
            <div className="stat-items">
              {card.items.map((item, i) => (
                <div key={i} className="stat-item">
                  {item.title || item.name || item.friendUsername || item.username}
                </div>
              ))}
              {card.items.length === 0 && <div className="stat-empty">No items yet</div>}
            </div>
            <Link to={card.to} className="stat-link">
              View all <FiArrowRight />
            </Link>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/events?create=true" className="action-card">
            <FiCalendar />
            <span>Create Event</span>
          </Link>
          <Link to="/clubs?create=true" className="action-card">
            <FiShield />
            <span>Create Club</span>
          </Link>
          <Link to="/journals?create=true" className="action-card">
            <FiBookOpen />
            <span>Write Journal</span>
          </Link>
          <Link to="/friends" className="action-card">
            <FiUsers />
            <span>Find Friends</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
