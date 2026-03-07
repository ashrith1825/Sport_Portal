import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJournals, searchJournals, createJournal, deleteJournal } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import { FiPlus, FiSearch, FiTrash2, FiX, FiEdit3, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import '../Events/Events.css';

export default function Journals() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(searchParams.get('create') === 'true');
  const [form, setForm] = useState({ title: '', content: '', sportType: '', imageUrl: '' });

  const fetchJournals = async () => {
    try {
      const res = search ? await searchJournals(search) : await getJournals();
      setJournals(res.data);
    } catch {
      toast.error('Failed to load journals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJournals(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchJournals();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createJournal(form);
      toast.success('Journal published!');
      setShowModal(false);
      setForm({ title: '', content: '', sportType: '', imageUrl: '' });
      setLoading(true);
      fetchJournals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create journal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal?')) return;
    try {
      await deleteJournal(id);
      toast.success('Journal deleted');
      fetchJournals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Journals</h1>
          <p className="page-subtitle">Sports articles and stories</p>
        </div>
        {user && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Write Journal
          </button>
        )}
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <FiSearch />
        <input type="text" placeholder="Search journals..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn-search">Search</button>
      </form>

      <div className="card-grid">
        {journals.map((journal) => (
          <div key={journal.id} className="card">
            <div className="card-top">
              {journal.sportType && <span className="sport-badge">{journal.sportType}</span>}
              <span className="status-badge status-upcoming"><FiClock /> {formatDate(journal.createdAt)}</span>
            </div>
            <h3 className="card-title">{journal.title}</h3>
            <p className="card-desc">{journal.content}</p>
            {journal.imageUrl && <img src={journal.imageUrl} alt="" className="card-image" />}
            <div className="card-footer">
              <span className="card-author"><FiEdit3 /> {journal.authorUsername}</span>
              <div className="card-actions">
                {user && journal.authorId === user.id && (
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(journal.id)}><FiTrash2 /></button>
                )}
              </div>
            </div>
          </div>
        ))}
        {journals.length === 0 && <div className="empty-state">No journals found. Write one!</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write Journal</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Sport Type</label>
                <input value={form.sportType} onChange={(e) => setForm({ ...form, sportType: e.target.value })} placeholder="e.g. Football" />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary">Publish Journal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
