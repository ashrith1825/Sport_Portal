import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEvents, searchEvents, createEvent, joinEvent, leaveEvent, deleteEvent } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import { FiPlus, FiSearch, FiMapPin, FiClock, FiUsers, FiTrash2, FiX, FiList, FiMap } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import './Events.css';

// Fix default marker icon issue with Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function Events() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showModal, setShowModal] = useState(searchParams.get('create') === 'true');
  const [form, setForm] = useState({ title: '', description: '', sportType: '', location: '', eventDate: '', endDate: '', maxParticipants: '', latitude: '', longitude: '' });

  const fetchEvents = async () => {
    try {
      const res = search ? await searchEvents(search) : await getEvents();
      setEvents(res.data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchEvents();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.maxParticipants) payload.maxParticipants = parseInt(payload.maxParticipants);
      else delete payload.maxParticipants;
      if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
      else delete payload.latitude;
      if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
      else delete payload.longitude;
      await createEvent(payload);
      toast.success('Event created!');
      setShowModal(false);
      setForm({ title: '', description: '', sportType: '', location: '', eventDate: '', endDate: '', maxParticipants: '', latitude: '', longitude: '' });
      setLoading(true);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleJoin = async (id) => {
    try {
      await joinEvent(id);
      toast.success('Joined event!');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async (id) => {
    try {
      await leaveEvent(id);
      toast.success('Left event');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getStatusClass = (status) => {
    const classes = { UPCOMING: 'status-upcoming', ONGOING: 'status-ongoing', COMPLETED: 'status-completed', CANCELLED: 'status-cancelled' };
    return classes[status] || '';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p className="page-subtitle">Discover and join sports events</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FiList />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`} 
              onClick={() => setViewMode('map')}
              title="Map View"
            >
              <FiMap />
            </button>
          </div>
          {user && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> Create Event
            </button>
          )}
        </div>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <FiSearch />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-search">Search</button>
      </form>

      {viewMode === 'map' ? (
        <div className="map-container">
          <MapContainer
            center={[40.7580, -73.9855]}
            zoom={12}
            style={{ height: '500px', width: '100%', borderRadius: 'var(--radius-lg)' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.filter(e => e.latitude && e.longitude).map((event) => (
              <Marker key={event.id} position={[event.latitude, event.longitude]}>
                <Popup>
                  <div className="map-popup">
                    <h4>{event.title}</h4>
                    <p className="popup-sport">{event.sportType}</p>
                    <p className="popup-location"><FiMapPin /> {event.location}</p>
                    <p className="popup-date"><FiClock /> {formatDate(event.eventDate)}</p>
                    <p className="popup-participants"><FiUsers /> {event.participantCount}{event.maxParticipants ? `/${event.maxParticipants}` : ''} participants</p>
                    {user && event.organizerId !== user.id && (
                      event.participantIds?.includes(user.id)
                        ? <button className="btn-sm btn-leave" onClick={() => handleLeave(event.id)}>Leave</button>
                        : <button className="btn-sm btn-join" onClick={() => handleJoin(event.id)}>Join</button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="card-grid">
        {events.map((event) => (
          <div key={event.id} className="card">
            <div className="card-top">
              <span className={`status-badge ${getStatusClass(event.status)}`}>{event.status}</span>
              <span className="sport-badge">{event.sportType}</span>
            </div>
            <h3 className="card-title">{event.title}</h3>
            <p className="card-desc">{event.description}</p>
            <div className="card-meta">
              {event.location && <span><FiMapPin /> {event.location}</span>}
              <span><FiClock /> {formatDate(event.eventDate)}</span>
              <span><FiUsers /> {event.participantCount}{event.maxParticipants ? `/${event.maxParticipants}` : ''}</span>
            </div>
            <div className="card-footer">
              <span className="card-author">by {event.organizerUsername}</span>
              <div className="card-actions">
                {user && event.organizerId !== user.id && (
                  event.participantIds?.includes(user.id)
                    ? <button className="btn-sm btn-leave" onClick={() => handleLeave(event.id)}>Leave</button>
                    : <button className="btn-sm btn-join" onClick={() => handleJoin(event.id)}>Join</button>
                )}
                {user && event.organizerId === user.id && (
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(event.id)}><FiTrash2 /></button>
                )}
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="empty-state">No events found. Create one!</div>}
      </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Event</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Sport Type *</label>
                <input value={form.sportType} onChange={(e) => setForm({ ...form, sportType: e.target.value })} required placeholder="e.g. Football, Basketball" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" placeholder="e.g. 40.7580" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" placeholder="e.g. -73.9855" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Max Participants</label>
                <input type="number" min="1" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Create Event</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
