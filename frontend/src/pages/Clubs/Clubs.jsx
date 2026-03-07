import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getClubs, searchClubs, createClub, joinClub, leaveClub, deleteClub } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import { FiPlus, FiSearch, FiUsers, FiTrash2, FiX, FiLayers } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import '../Events/Events.css';

export default function Clubs() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(searchParams.get('create') === 'true');
  const [form, setForm] = useState({ name: '', description: '', sportType: '', logoUrl: '' });

  const fetchClubs = async () => {
    try {
      const res = search ? await searchClubs(search) : await getClubs();
      setClubs(res.data);
    } catch {
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClubs(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchClubs();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createClub(form);
      toast.success('Club created!');
      setShowModal(false);
      setForm({ name: '', description: '', sportType: '', logoUrl: '' });
      setLoading(true);
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    }
  };

  const handleJoin = async (id) => {
    try {
      await joinClub(id);
      toast.success('Joined club!');
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async (id) => {
    try {
      await leaveClub(id);
      toast.success('Left club');
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this club?')) return;
    try {
      await deleteClub(id);
      toast.success('Club deleted');
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Clubs</h1>
          <p className="page-subtitle">Find and join sports clubs</p>
        </div>
        {user && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Create Club
          </button>
        )}
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <FiSearch />
        <input type="text" placeholder="Search clubs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn-search">Search</button>
      </form>

      <div className="card-grid">
        {clubs.map((club) => (
          <div key={club.id} className="card">
            <div className="card-top">
              <span className="sport-badge">{club.sportType}</span>
              <span className="member-count-badge"><FiUsers /> {club.memberCount} members</span>
            </div>
            <h3 className="card-title">{club.name}</h3>
            <p className="card-desc">{club.description}</p>
            <div className="card-meta">
              <span><FiLayers /> {club.teamCount} teams</span>
            </div>
            <div className="card-footer">
              <span className="card-author">by {club.ownerUsername}</span>
              <div className="card-actions">
                {user && club.ownerId !== user.id && (
                  club.memberIds?.includes(user.id)
                    ? <button className="btn-sm btn-leave" onClick={() => handleLeave(club.id)}>Leave</button>
                    : <button className="btn-sm btn-join" onClick={() => handleJoin(club.id)}>Join</button>
                )}
                {user && club.ownerId === user.id && (
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(club.id)}><FiTrash2 /></button>
                )}
              </div>
            </div>
          </div>
        ))}
        {clubs.length === 0 && <div className="empty-state">No clubs found. Create one!</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Club</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Club Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Sport Type *</label>
                <input value={form.sportType} onChange={(e) => setForm({ ...form, sportType: e.target.value })} required placeholder="e.g. Football, Tennis" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Logo URL</label>
                <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary">Create Club</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
