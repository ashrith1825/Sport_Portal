import { useEffect, useRef, useState } from 'react';
import { getClubMessages, postClubMessage, deleteClubMessage, getClub } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import toast from 'react-hot-toast';
import './ClubChat.css';

export default function ClubChat({ clubId, open, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [clubOwnerId, setClubOwnerId] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const ref = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getClubMessages(clubId, 200);
        if (!mounted) return;
        setMessages(res.data || []);
      } catch (e) {
        // ignore
      }
    }
    async function loadClub() {
      try {
        const c = await getClub(clubId);
        setClubOwnerId(c.data?.ownerId || null);
      } catch (e) {
        // ignore
      }
    }
    if (open) load();
    if (open) loadClub();
    const interval = setInterval(() => { if (open) load(); }, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, [clubId, open]);

  // Focus input when opening chat
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await postClubMessage(clubId, text.trim());
      setText('');
      const res = await getClubMessages(clubId, 200);
      setMessages(res.data || []);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      toast.success('Message sent');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    }
    setSending(false);
  };

  if (!open) return null;

  return (
    <div className="chat-drawer">
      <div className="chat-header">
        <h4>Club Chat</h4>
        <button className="chat-close" onClick={onClose}>×</button>
      </div>
      <div className="chat-body" ref={bodyRef}>
        {messages.map((m) => (
          <div key={m._id} className="chat-message">
            <div className="chat-meta">
              <strong>{m.from?.username || m.from?.firstName}</strong>
              <small>{new Date(m.createdAt).toLocaleString()}</small>
            </div>
            <div className="chat-text">{m.text}</div>
            {(user && (m.from?._id === user.id || clubOwnerId === user.id)) && (
              <button className="btn-sm btn-danger chat-delete" onClick={async () => {
                if (!confirm('Delete this message?')) return;
                try {
                  await deleteClubMessage(m._id);
                  const res = await getClubMessages(clubId, 200);
                  setMessages(res.data || []);
                } catch (err) {
                  // ignore
                }
              }}>Delete</button>
            )}
          </div>
        ))}
        <div ref={ref} />
      </div>
      <form className="chat-input" onSubmit={send}>
        <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." />
        <button type="submit" aria-disabled={sending || !text.trim()} disabled={sending || !text.trim()}>{sending ? 'Sending...' : 'Send'}</button>
      </form>
    </div>
  );
}
