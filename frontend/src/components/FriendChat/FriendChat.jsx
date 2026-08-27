import { useCallback, useEffect, useState } from 'react';
import { getDirectMessages, postDirectMessage, deleteDirectMessage } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import toast from 'react-hot-toast';
import ChatSidebar from '../ChatSidebar/ChatSidebar';

export default function FriendChat({ friendId, friendName = 'friend chat', open }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

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
      try {
        const response = await getDirectMessages(friendId, 200);
        if (mounted) setMessages(normalize(response.data || []));
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
      await postDirectMessage(friendId, text);
      const response = await getDirectMessages(friendId, 200);
      setMessages(normalize(response.data || []));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'failed to send message');
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
    <ChatSidebar
      mode="friend"
      participant={{ id: friendId, name: friendName, isOnline: false }}
      messages={messages}
      currentUserId={user?.id}
      onSend={send}
      onDelete={remove}
      isOpen={open}
    />
  );
}
