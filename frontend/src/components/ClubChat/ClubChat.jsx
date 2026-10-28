import { useEffect, useRef, useState } from 'react';
import { getClubMessages, postClubMessage, deleteClubMessage, getClub } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import toast from 'react-hot-toast';
import ChatSidebar from '../ChatSidebar/ChatSidebar';

function normalizeMessages(items, userId) {
  return items.map((message) => ({
    id: message._id,
    senderId: message.from?._id,
    senderName: message.from?.username || message.from?.firstName || 'member',
    senderAvatarUrl: message.from?.avatarUrl,
    text: message.text,
    timestamp: message.createdAt,
    isOwnMessage: String(message.from?._id) === String(userId),
  }));
}

export default function ClubChat({ clubId, open }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loadedClubId, setLoadedClubId] = useState(null);
  const [club, setClub] = useState(null);
  const loadSequence = useRef(0);
  const visibleMessages = loadedClubId === clubId ? messages : [];

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!clubId) return;
      const sequence = ++loadSequence.current;
      try {
        const response = await getClubMessages(clubId, 200);
        if (mounted && sequence === loadSequence.current) {
          setMessages(normalizeMessages(response.data || [], user?.id));
          setLoadedClubId(clubId);
        }
      } catch {
        if (mounted) toast.error('failed to load club chat');
      }
    }
    async function loadClub() {
      if (!clubId) return;
      try {
        const response = await getClub(clubId);
        if (mounted) setClub(response.data);
      } catch {
        if (mounted) setClub(null);
      }
    }
    if (open) {
      load();
      loadClub();
    }
    const interval = setInterval(() => { if (open) load(); }, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, [clubId, open, user?.id]);

  const send = async (text) => {
    try {
      const response = await postClubMessage(clubId, text);
      const message = normalizeMessages([response.data], user?.id)[0];
      loadSequence.current += 1;
      setMessages((current) => [...current.filter((item) => item.id !== message.id), message]);
      setLoadedClubId(clubId);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'failed to send message');
      return false;
    }
  };

  const remove = async (messageId) => {
    try {
      await deleteClubMessage(messageId);
      setMessages((current) => current.filter((message) => message.id !== messageId));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'failed to delete message');
    }
  };

  return (
    <ChatSidebar
      mode="club"
      participant={{
        id: clubId,
        name: club?.name || 'club chat',
        avatarUrl: club?.logoUrl,
        memberCount: club?.memberCount || club?.members?.length,
      }}
      messages={visibleMessages}
      currentUserId={user?.id}
      onSend={send}
      onDelete={remove}
      isOpen={open}
    />
  );
}
