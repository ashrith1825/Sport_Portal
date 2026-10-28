import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClubs, getUpcomingEvents, getJournals } from '../../api/services';
import './Home.css';

export default function Home() {
  const [snapshot, setSnapshot] = useState({ clubs: null, events: null, journals: null, failed: false });

  useEffect(() => {
    let active = true;
    Promise.allSettled([getClubs(), getUpcomingEvents(), getJournals()]).then((results) => {
      if (!active) return;
      const [clubs, events, journals] = results;
      const counts = {
        clubs: clubs.status === 'fulfilled' ? clubs.value.data.length : null,
        events: events.status === 'fulfilled' ? events.value.data.length : null,
        journals: journals.status === 'fulfilled' ? journals.value.data.length : null,
        failed: results.some((result) => result.status === 'rejected'),
      };
      setSnapshot(counts);
    });
    return () => { active = false; };
  }, []);

  const entries = [
    { label: 'Clubs', count: snapshot.clubs, to: '/clubs' },
    { label: 'Upcoming events', count: snapshot.events, to: '/events' },
    { label: 'Journals', count: snapshot.journals, to: '/journals' },
  ];

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Public first. Login only when needed.</span>
          <h1>Discover clubs, read journals, and join events from one clean dashboard.</h1>
          <p>
            Browse featured clubs, upcoming events, and fresh journal entries before you ever sign in.
            When you are ready, the same experience opens into full club, team, and event management.
          </p>

          <div className="home-actions">
            <Link className="home-btn home-btn-primary" to="/clubs">Explore Sport Portal</Link>
          </div>
        </div>

        <div className="home-visual">
          <div className="home-panel">
            <div className="home-panel-head">
              <p className="home-panel-label">Activity snapshot</p>
              <span>{snapshot.failed ? 'Some totals are unavailable' : 'Current community totals'}</span>
            </div>
            <div className="home-panel-grid">
              {entries.map((entry) => (
                <Link className="home-overview-item" to={entry.to} key={entry.label}>
                  <strong>{entry.count ?? '—'}</strong>
                  <span>{entry.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}