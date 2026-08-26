import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
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
              <p className="home-panel-label">Community at a glance</p>
              <span>Live data from the API</span>
            </div>
            <div className="home-panel-grid home-panel-grid-empty">
              <strong>find your people.</strong>
              <span>clubs, events, teams, and stories are waiting inside.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}