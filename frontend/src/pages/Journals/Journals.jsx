import { useEffect, useState } from 'react';
import { getJournals, searchJournals, createJournal, deleteJournal } from '../../api/services';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import { FiPlus, FiSearch, FiTrash2, FiX, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import './Journals.css';

function authorInitials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || '?';
}

export default function Journals() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', sportType: '', imageUrl: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await getJournals();
        setJournals(res.data || []);
        setLoadError('');
      } catch {
        setLoadError('Journals could not be loaded. Refresh to try again.');
        toast.error('Failed to load journals');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === 'true' && user) {
      setShowModal(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('create');
      setSearchParams(nextParams, { replace: true });
    } else if (searchParams.has('create') && !authLoading) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('create');
      setSearchParams(nextParams, { replace: true });
    }
  }, [authLoading, searchParams, setSearchParams, user]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = search ? await searchJournals(search) : await getJournals();
      setJournals(res.data || []);
      setLoadError('');
    } catch {
      setLoadError('Search failed. Check your connection and try again.');
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in to write a journal');
    try {
      await createJournal(form);
      setShowModal(false);
      setForm({ title: '', content: '', sportType: '', imageUrl: '' });
      const res = await getJournals();
      setJournals(res.data || []);
      toast.success('Journal published');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create journal');
    }
  };

  const handleDelete = async (id) => {
    if (!user) return toast.error('Please log in');
    if (!confirm('Delete this journal?')) return;
    try {
      await deleteJournal(id);
      const res = await getJournals();
      setJournals(res.data || []);
      toast.success('Journal deleted');
    } catch {
      toast.error('Failed to delete');
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

      {loadError && <p className="page-error" role="alert">{loadError}</p>}

      <div className="card-grid">
        {journals.length === 0 && !loadError && <div className="empty-state">No journals found. Write one!</div>}

        {journals.map((journal) => {
          const jid = journal.id || journal._id;
          return (
            <article key={jid} className="card journal-card">
              <Link className="journal-card-hit-area" to={`/journals/${jid}`} aria-label={`Read journal: ${journal.title}`} />
              <div className="journal-card-content">
                <div className="card-top">
                {journal.sportType && <span className="sport-badge">{journal.sportType}</span>}
                <span className="status-badge status-upcoming"><FiClock /> {formatDate(journal.createdAt)}</span>
              </div>
                {journal.imageUrl && <img src={journal.imageUrl} alt="" className="card-image" loading="lazy" />}
                <h3 className="card-title">{journal.title}</h3>
              <p className="card-desc">{journal.content?.substring(0, 220) || ''}{(journal.content || '').length > 220 ? '…' : ''}</p>
              </div>
              <footer className="card-footer journal-card-footer">
                <div className="journal-author">
                  {journal.authorAvatarUrl
                    ? <img src={journal.authorAvatarUrl} alt="" className="journal-author-avatar" />
                    : <span className="journal-author-avatar journal-author-initials">{authorInitials(journal.authorDisplayName)}</span>}
                  <span><strong>{journal.authorDisplayName || 'Unknown author'}</strong><small>{journal.authorUsername ? `@${journal.authorUsername}` : 'Author'}</small></span>
                </div>
                {user && journal.authorId === user.id && (
                  <button className="btn-sm btn-danger journal-card-action" onClick={() => handleDelete(jid)} aria-label={`Delete ${journal.title}`}>
                    <FiTrash2 />
                  </button>
                )}
              </footer>
            </article>
          );
        })}
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
