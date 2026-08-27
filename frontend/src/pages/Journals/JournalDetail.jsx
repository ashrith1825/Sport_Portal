import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJournal } from '../../api/services';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import '../Events/Events.css';

export default function JournalDetail() {
  const { id } = useParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getJournal(id);
        if (!mounted) return;
        setJournal(res.data);
      } catch {
        toast.error('Failed to load journal');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!journal) return <div className="page"><p>Journal not found.</p></div>;

  return (
    <div className="page journal-detail">
      <div className="page-header">
        <div>
          <h1>{journal.title}</h1>
          <p className="page-subtitle">By {journal.authorUsername} • {new Date(journal.createdAt).toLocaleDateString()}</p>
        </div>
        <Link to="/journals" className="btn-sm">Back</Link>
      </div>
      {journal.imageUrl && <img src={journal.imageUrl} alt="" className="journal-hero" />}
      <div className="card-desc" style={{ whiteSpace: 'pre-wrap' }}>{journal.content}</div>
    </div>
  );
}
