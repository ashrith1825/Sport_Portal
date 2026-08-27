import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getClubs,
  searchClubs,
  createClub,
  joinClub,
  leaveClub,
  deleteClub,
} from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import { FiPlus, FiSearch, FiUsers, FiTrash2, FiX, FiLayers, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import { countLabel } from '../../utils/countLabel';
import '../Events/Events.css';

export default function Clubs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', sportType: '', logoUrl: '' });

  const loadClubs = async () => {
    try {
      const res = await getClubs();
      setClubs(res.data || []);
    } catch {
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = search ? await searchClubs(search) : await getClubs();
      setClubs(res.data || []);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in to create a club');
    try {
      await createClub(form);
      toast.success('Club created');
      setShowModal(false);
      setForm({ name: '', description: '', sportType: '', logoUrl: '' });
      await loadClubs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create club');
    }
  };

  const handleJoin = async (id) => {
    if (!user) return toast.error('Please log in');
    try {
      await joinClub(id);
      toast.success('Club join request sent');
      await loadClubs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async (id) => {
    if (!user) return toast.error('Please log in');
    try {
      await leaveClub(id);
      toast.success('You left the club');
      await loadClubs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to leave');
    }
  };

  const handleDelete = async (id) => {
    if (!user) return toast.error('Please log in');
    if (!confirm('Delete this club?')) return;
    try {
      await deleteClub(id);
      await loadClubs();
      toast.success('Club deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
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
        {clubs.length === 0 && <div className="empty-state">No clubs found. Create one!</div>}
        {clubs.map((club) => {
          const cid = club.id || club._id;
          const memberIds = Array.isArray(club.memberIds) ? club.memberIds : [];
          const memberIncludes = user ? memberIds.includes(user.id) || memberIds.includes(user._id) : false;

          return (
            <div
              key={cid}
              className="card"
              onClick={() => navigate(`/clubs/${cid}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top">
                <span className="sport-badge">{club.sportType}</span>
                <span className="member-count-badge"><FiUsers /> {countLabel(club.memberCount, 'member')}</span>
              </div>
              <h3 className="card-title">{club.name}</h3>
              <p className="card-desc">{club.description || 'No description yet.'}</p>
              <div className="card-meta">
                <span><FiLayers /> {countLabel(club.teamCount, 'team')}</span>
              </div>
              <div className="card-footer">
                <span className="card-author">by {club.ownerUsername}</span>
                <div className="card-actions">
                  <button
                    className="btn-sm btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clubs/${cid}`);
                    }}
                  >
                    Details <FiArrowRight />
                  </button>

                  {user && club.ownerId !== user.id && (
                    memberIncludes
                      ? <button className="btn-sm btn-leave" onClick={(e) => { e.stopPropagation(); handleLeave(cid); }}>Leave</button>
                      : <button className="btn-sm btn-join" onClick={(e) => { e.stopPropagation(); handleJoin(cid); }}>Join</button>
                  )}

                  {user && club.ownerId === user.id && (
                    <button className="btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(cid); }}><FiTrash2 /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
