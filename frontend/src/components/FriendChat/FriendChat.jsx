import { useEffect, useRef, useState } from 'react';
import { getDirectMessages, postDirectMessage } from '../../api/services';
import toast from 'react-hot-toast';
import './FriendChat.css';

export default function FriendChat({ friendId, friendName = 'Friend', open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const ref = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getDirectMessages(friendId, 200);
        if (!mounted) return;
        setMessages(res.data || []);
      } catch (e) {
        // ignore
      }
    }
    if (open) load();
    const interval = setInterval(() => { if (open) load(); }, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, [friendId, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await postDirectMessage(friendId, text.trim());
      setText('');
      const res = await getDirectMessages(friendId, 200);
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
        <h4>{friendName}</h4>
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
