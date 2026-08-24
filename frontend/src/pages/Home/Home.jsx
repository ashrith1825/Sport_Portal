import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { featuredClubs, featuredEvents, featuredJournals } from './seed';
import './Home.css';

export default function Home() {
  const [counts, setCounts] = useState({ clubs: 0, events: 0, journals: 0, demo: 1 });
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        const [clubsRes, eventsRes, journalsRes] = await Promise.all([
          API.get('/clubs'),
          API.get('/events/upcoming'),
          API.get('/journals'),
        ]);

        if (!mounted) return;

        const clubsData = Array.isArray(clubsRes.data) && clubsRes.data.length ? clubsRes.data : featuredClubs;
        const eventsData = Array.isArray(eventsRes.data) && eventsRes.data.length ? eventsRes.data : featuredEvents;
        const journalsData = Array.isArray(journalsRes.data) && journalsRes.data.length ? journalsRes.data : featuredJournals;

        setClubs(clubsData);
        setEvents(eventsData);
        setJournals(journalsData);

        setCounts({
          clubs: clubsData.length,
          events: eventsData.length,
          journals: journalsData.length,
          demo: 1,
        });
      } catch (err) {
        // fallback to seeded demo data on error
        if (!mounted) return;
        setClubs(featuredClubs);
        setEvents(featuredEvents);
        setJournals(featuredJournals);
        setCounts({ clubs: featuredClubs.length, events: featuredEvents.length, journals: featuredJournals.length, demo: 1 });
      }
    }

    loadAll();

    return () => {
      mounted = false;
    };
  }, []);

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
            <Link className="home-btn home-btn-primary" to="/clubs">Explore Clubs</Link>
            <Link className="home-btn home-btn-secondary" to="/events">Explore Events</Link>
            <Link className="home-btn home-btn-secondary" to="/journals">Explore Journals</Link>
          </div>

          <div className="home-inline-links"><span>No account prompt up front. Browse first, sign in later.</span></div>
        </div>

        <div className="home-visual">
          <div className="home-panel">
            <div className="home-panel-head">
              <p className="home-panel-label">Community at a glance</p>
              <span>Live data from the API</span>
            </div>
            <div className="home-panel-grid">
              <article><strong>{counts.clubs}</strong><span>Featured clubs</span></article>
              <article><strong>{counts.events}</strong><span>Upcoming events</span></article>
              <article><strong>{counts.journals}</strong><span>Public journals</span></article>
              <article><strong>{counts.demo}</strong><span>Demo login</span></article>
            </div>
          </div>
        </div>
      </section>

      <section className="home-highlights">
        {[{ title: 'Clubs', text: 'See clubs and their sport types.' }, { title: 'Events', text: 'Upcoming public sessions and locations.' }, { title: 'Teams', text: 'Club squads and captains.' }, { title: 'Journals', text: 'Stories and training notes.' }].map((item) => (
          <article className="home-card" key={item.title}><h2>{item.title}</h2><p>{item.text}</p></article>
        ))}
      </section>

      <section className="home-showcase" id="featured-clubs">
        <div className="home-showcase-block">
          <h2>Featured Clubs</h2>
          <div className="home-showcase-grid">
            {(clubs || featuredClubs).slice(0, 6).map((club) => (
              <article className="home-showcase-card" key={club._id || club.name}>
                <span className="home-chip">{club.sportType || club.sport}</span>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
                <small>{club.members?.length ?? club.memberCount ?? ''}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="home-showcase-block" id="featured-journals">
          <h2>Featured Journals</h2>
          <div className="home-showcase-grid">
            {(journals || featuredJournals).slice(0, 6).map((journal) => (
              <article className="home-showcase-card" key={journal._id || journal.title}>
                <span className="home-chip">{journal.sportType}</span>
                <h3>{journal.title}</h3>
                <p>{journal.content?.slice(0, 120) ?? journal.excerpt}</p>
                <small>By @{journal.author || journal.authorName}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="home-showcase-block" id="featured-events">
          <h2>Featured Events</h2>
          <div className="home-showcase-grid home-showcase-grid-2">
            {(events || featuredEvents).slice(0, 6).map((event) => (
              <article className="home-showcase-card" key={event._id || event.title}>
                <span className="home-chip">{event.sportType}</span>
                <h3>{event.title}</h3>
                <p>{event.location || event.venue}</p>
                <small>{event.eventDate || event.when}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}