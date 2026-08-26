import { useEffect, useRef, useState } from 'react';
import { FiMessageSquare, FiSend, FiUsers } from 'react-icons/fi';
import { countLabel } from '../../utils/countLabel';
import './ChatSidebar.css';

function initials(name = '?') {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

function messageKey(message) {
  return message.id || `${message.senderId}-${message.timestamp}-${message.text}`;
}

function isGrouped(previous, message) {
  if (!previous || previous.senderId !== message.senderId) return false;
  return Math.abs(new Date(message.timestamp).getTime() - new Date(previous.timestamp).getTime()) < 300000;
}

export default function ChatSidebar({
  mode,
  participant,
  messages = [],
  currentUserId,
  onSend,
  onDelete,
  isOpen,
}) {
  const [drafts, setDrafts] = useState({});
  const inputRef = useRef(null);
  const chatKey = `${mode}:${participant?.id || 'empty'}`;
  const draft = drafts[chatKey] || '';

  const isVisible = typeof isOpen === 'boolean' ? isOpen : true;

  useEffect(() => {
    if (isVisible) inputRef.current?.focus();
  }, [chatKey, isVisible]);

  const updateDraft = (value) => {
    setDrafts((current) => ({ ...current, [chatKey]: value }));
  };

  const send = (event) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value || !isVisible) return;
    onSend(value);
    updateDraft('');
  };

  const title = participant?.name || (mode === 'club' ? 'club chat' : 'friend chat');
  const subtitle = mode === 'club'
    ? countLabel(participant?.memberCount, 'member')
    : (participant?.isOnline ? 'online now' : 'offline');

  if (!isVisible) return null;

  return (
    <aside
      className="chat-sidebar"
      aria-hidden={false}
      aria-label={`${mode} chat`}
      data-current-user-id={currentUserId || ''}
    >
      <header className="chat-sidebar-header">
        <div className="chat-sidebar-identity">
          {participant?.avatarUrl ? (
            <img className="chat-sidebar-avatar" src={participant.avatarUrl} alt="" />
          ) : (
            <span className="chat-sidebar-avatar chat-sidebar-avatar-fallback">
              {mode === 'club' ? <FiUsers /> : initials(title)}
            </span>
          )}
          <div>
            <h2>{title}</h2>
            <p className={mode === 'friend' ? (participant?.isOnline ? 'is-online' : 'is-offline') : ''}>
              {mode === 'friend' && <span className="chat-status-dot" />}
              {subtitle}
            </p>
          </div>
        </div>
      </header>

      <div className="chat-sidebar-body" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="chat-empty">
            <FiMessageSquare />
            <strong>say hi first</strong>
            <span>your next good conversation starts here.</span>
          </div>
        )}
        {messages.map((message, index) => {
          const own = message.isOwnMessage === true;
          const grouped = isGrouped(messages[index - 1], message);
          return (
            <article key={messageKey(message)} className={`chat-message-row ${own ? 'is-own' : 'is-other'} ${grouped ? 'is-grouped' : ''}`}>
              {!own && !grouped && (
                message.senderAvatarUrl
                  ? <img className="chat-message-avatar" src={message.senderAvatarUrl} alt="" />
                  : <span className="chat-message-avatar chat-message-avatar-fallback">{initials(message.senderName)}</span>
              )}
              {!own && grouped && <span className="chat-message-avatar-spacer" />}
              <div className="chat-message-content">
                {mode === 'club' && !own && !grouped && <strong className="chat-sender-name">{message.senderName}</strong>}
                <div className="chat-bubble">{message.text}</div>
                <div className="chat-message-meta">
                  <time dateTime={message.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  {own && <button type="button" className="chat-delete" onClick={() => onDelete(message.id)} aria-label="Delete message">Delete</button>}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <form className="chat-sidebar-input" onSubmit={send}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => updateDraft(event.target.value)}
          placeholder="write a message..."
          aria-label="Write a message"
        />
        <button type="submit" disabled={!draft.trim()} aria-label="Send message">
          <FiSend />
        </button>
      </form>
    </aside>
  );
}
