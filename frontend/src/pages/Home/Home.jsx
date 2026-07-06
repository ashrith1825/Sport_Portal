import { Link } from 'react-router-dom';
import { featuredClubs, featuredEvents, featuredJournals } from './seed';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <div className="home-strip">
        <span>Trending</span>
        <div className="home-strip-links">
          <a href="#featured-clubs">Clubs</a>
          <a href="#featured-events">Events</a>
          <a href="#featured-journals">Journals</a>
        </div>
      </div>

      <header className="home-topbar">
        <Link to="/" className="home-brand">
          <span>
            <strong>Sport Portal</strong>
            <small>Public sports community hub</small>
          </span>
        </Link>

        <div className="home-top-actions">
          <Link className="home-top-link" to="/clubs">Explore</Link>
          <Link className="home-top-link home-top-link-accent" to="/login">Login</Link>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Public first. Login only when needed.</span>
          <h1>Discover clubs, read journals, and join events from one clean dashboard.</h1>
          <p>
            Browse featured clubs, upcoming events, and fresh journal entries before you ever sign in.
            When you are ready, the same experience opens into full club, team, and event management.
          </p>

          <div className="home-actions">
            <Link className="home-btn home-btn-primary" to="/clubs">
              Explore Clubs
            </Link>
            <Link className="home-btn home-btn-secondary" to="/events">
              Explore Events
            </Link>
            <Link className="home-btn home-btn-secondary" to="/journals">
              Explore Journals
            </Link>
          </div>

          <div className="home-inline-links">
            <span>No account prompt up front. Browse first, sign in later.</span>
          </div>
        </div>

        <div className="home-visual">
          <div className="home-panel">
            <div className="home-panel-head">
              <p className="home-panel-label">Community at a glance</p>
              <span>Seeded demo content is ready to explore</span>
            </div>
            <div className="home-panel-grid">
              <article>
                <strong>3</strong>
                <span>Featured clubs</span>
              </article>
              <article>
                <strong>2</strong>
                <span>Upcoming events</span>
              </article>
              <article>
                <strong>3</strong>
                <span>Public journals</span>
              </article>
              <article>
                <strong>1</strong>
                <span>Demo login</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="home-highlights">
        {[
          { title: 'Clubs', text: 'See seeded clubs, their sport type, and who owns each one.' },
          { title: 'Events', text: 'Check upcoming public sessions and their location details.' },
          { title: 'Teams', text: 'Understand how club squads are organized at a glance.' },
          { title: 'Journals', text: 'Read public training notes and match reflections.' },
        ].map((item) => (
          <article className="home-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="home-showcase" id="featured-clubs">
        <div className="home-showcase-block">
          <h2>Featured Clubs</h2>
          <div className="home-showcase-grid">
            {featuredClubs.map((club) => (
              <article className="home-showcase-card" key={club.name}>
                <span className="home-chip">{club.sportType}</span>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
                <small>{club.memberCount}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="home-showcase-block" id="featured-journals">
          <h2>Featured Journals</h2>
          <div className="home-showcase-grid">
            {featuredJournals.map((journal) => (
              <article className="home-showcase-card" key={journal.title}>
                <span className="home-chip">{journal.sportType}</span>
                <h3>{journal.title}</h3>
                <p>{journal.content}</p>
                <small>By @{journal.author}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="home-showcase-block" id="featured-events">
          <h2>Featured Events</h2>
          <div className="home-showcase-grid home-showcase-grid-2">
            {featuredEvents.map((event) => (
              <article className="home-showcase-card" key={event.title}>
                <span className="home-chip">{event.sportType}</span>
                <h3>{event.title}</h3>
                <p>{event.location}</p>
                <small>{event.when}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}