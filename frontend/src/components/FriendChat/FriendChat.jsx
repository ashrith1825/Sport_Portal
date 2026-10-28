import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getDirectMessages, postDirectMessage, deleteDirectMessage } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import toast from 'react-hot-toast';
import ChatSidebar from '../ChatSidebar/ChatSidebar';

export default function FriendChat({ friendId, friendName = 'friend chat', open, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loadedFriendId, setLoadedFriendId] = useState(null);
  const loadSequence = useRef(0);
  const panelRef = useRef(null);
  const visibleMessages = loadedFriendId === friendId ? messages : [];

  useLayoutEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const returnFocusTo = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll('button:not(:disabled), textarea, a[href], input:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      returnFocusTo?.focus();
    };
  }, [open, onClose]);

  const normalize = useCallback((items) => items.map((message) => ({
    id: message._id,
    senderId: message.from?._id,
    senderName: message.from?.username || message.from?.firstName || friendName,
    senderAvatarUrl: message.from?.avatarUrl,
    text: message.text,
    timestamp: message.createdAt,
    isOwnMessage: String(message.from?._id) === String(user?.id),
  })), [friendName, user?.id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!friendId) return;
      const sequence = ++loadSequence.current;
      try {
        const response = await getDirectMessages(friendId, 200);
        if (mounted && sequence === loadSequence.current) {
          setMessages(normalize(response.data || []));
          setLoadedFriendId(friendId);
        }
      } catch {
        if (mounted) toast.error('failed to load messages');
      }
    }
    if (open) load();
    const interval = setInterval(() => { if (open) load(); }, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, [friendId, normalize, open]);

  const send = async (text) => {
    try {
      const response = await postDirectMessage(friendId, text);
      const message = normalize([response.data])[0];
      loadSequence.current += 1;
      setMessages((current) => [...current.filter((item) => item.id !== message.id), message]);
      setLoadedFriendId(friendId);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'failed to send message');
      return false;
    }
  };

  const remove = async (messageId) => {
    try {
      await deleteDirectMessage(messageId);
      setMessages((current) => current.filter((message) => message.id !== messageId));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'failed to delete message');
    }
  };

  return (
    <div className="chat-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <section ref={panelRef} className="chat-overlay-panel" role="dialog" aria-modal="true" aria-label={`Conversation with ${friendName}`}>
        <ChatSidebar
          key={friendId}
          mode="friend"
          participant={{ id: friendId, name: friendName }}
          messages={visibleMessages}
          currentUserId={user?.id}
          onSend={send}
          onDelete={remove}
          onClose={onClose}
          isOpen={open}
        />
      </section>
    </div>
  );
}
