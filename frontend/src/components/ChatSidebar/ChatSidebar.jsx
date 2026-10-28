import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiMessageSquare, FiSend, FiUsers, FiX } from 'react-icons/fi';
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
  onClose,
  isSending = false,
  isOpen,
}) {
  const [drafts, setDrafts] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const chatKey = `${mode}:${participant?.id || 'empty'}`;
  const inputRef = useRef(null);
  const historyRef = useRef(null);
  const wasAtBottom = useRef(true);
  const previousChatKey = useRef(chatKey);
  const draft = drafts[chatKey] || '';

  const isVisible = typeof isOpen === 'boolean' ? isOpen : true;

  useEffect(() => {
    if (isVisible) inputRef.current?.focus();
  }, [chatKey, isVisible]);

  const latestMessageKey = messages.length ? messageKey(messages[messages.length - 1]) : '';
  useLayoutEffect(() => {
    const history = historyRef.current;
    if (!history) return;
    if (previousChatKey.current !== chatKey) {
      previousChatKey.current = chatKey;
      wasAtBottom.current = true;
      history.scrollTop = history.scrollHeight;
    } else if (wasAtBottom.current) {
      history.scrollTop = history.scrollHeight;
    }
  }, [chatKey, latestMessageKey, messages.length]);

  const updateDraft = (value) => {
    setDrafts((current) => ({ ...current, [chatKey]: value }));
  };

  const send = async (event) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value || !isVisible || sending || isSending) return;
    setSending(true);
    setSendError('');
    try {
      const succeeded = await onSend(value);
      if (succeeded === false) {
        setSendError('Message could not be sent. Your draft is still here.');
        return;
      }
      updateDraft('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
    } catch {
      setSendError('Message could not be sent. Your draft is still here.');
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const title = participant?.name || (mode === 'club' ? 'club chat' : 'friend chat');
  const subtitle = mode === 'club'
    ? countLabel(participant?.memberCount, 'member')
    : 'Direct messages';

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
            <p>{subtitle}</p>
          </div>
        </div>
        {onClose && (
          <button type="button" className="chat-close" onClick={onClose} aria-label="Close chat">
            <FiX />
          </button>
        )}
      </header>

      <div
        className="chat-sidebar-body"
        ref={historyRef}
        role="log"
        aria-live="polite"
        onScroll={(event) => {
          const element = event.currentTarget;
          wasAtBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 56;
        }}
      >
        {messages.length === 0 && (
          <div className="chat-empty">
            <FiMessageSquare />
            <strong>Start the conversation</strong>
            <span>Send a message to get things moving.</span>
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

      <form className="chat-sidebar-composer" onSubmit={send} aria-busy={sending || isSending}>
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(event) => {
            updateDraft(event.target.value);
            setSendError('');
            event.currentTarget.style.height = 'auto';
            event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`;
          }}
          onKeyDown={handleComposerKeyDown}
          placeholder="Write a message..."
          aria-label="Write a message"
        />
        <button type="submit" disabled={!draft.trim() || sending || isSending} aria-label="Send message">
          <FiSend />
        </button>
        {sendError && <p className="chat-send-error" role="alert">{sendError}</p>}
      </form>
    </aside>
  );
}
