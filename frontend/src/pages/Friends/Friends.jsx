import { useEffect, useState } from 'react';
import { getFriends, getPendingRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, getAllUsers, sendFriendRequestByCode } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import { FiUserPlus, FiCheck, FiXCircle, FiTrash2, FiSearch, FiClock, FiCopy, FiHash, FiUsers } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import './Friends.css';

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('friends');
  const [search, setSearch] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [addingByCode, setAddingByCode] = useState(false);

  const fetchData = async () => {
    try {
      const [friendsRes, pendingRes, usersRes] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getAllUsers(),
      ]);
      setFriends(friendsRes.data.filter(f => f.status === 'ACCEPTED'));
      setPending(pendingRes.data);
      setUsers(usersRes.data.filter(u => u.id !== user.id));
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSendRequest = async (friendId) => {
    try {
      await sendFriendRequest(friendId);
      toast.success('Friend request sent!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleSendRequestByCode = async (e) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    setAddingByCode(true);
    try {
      await sendFriendRequestByCode(friendCode.trim().toUpperCase());
      toast.success('Friend request sent!');
      setFriendCode('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid friend code or already friends');
    } finally {
      setAddingByCode(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptFriendRequest(id);
      toast.success('Friend request accepted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectFriendRequest(id);
      toast.success('Request rejected');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this friend?')) return;
    try {
      await removeFriend(id);
      toast.success('Friend removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const copyFriendCode = () => {
    if (user?.friendCode) {
      navigator.clipboard.writeText(user.friendCode);
      toast.success('Friend code copied!');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase())) ||
    (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="friends-page">
      <div className="friends-header">
        <div>
          <h1>Friends</h1>
          <p className="page-subtitle">Connect with other sports enthusiasts</p>
        </div>
      </div>

      {/* Friend Code Section */}
      <div className="friend-code-section">
        <div className="friend-code-card your-code">
          <div className="friend-code-icon">
            <FiHash />
          </div>
          <div className="friend-code-content">
            <span className="friend-code-label">Your Friend Code</span>
            <div className="friend-code-value">
              <span>{user?.friendCode || 'N/A'}</span>
              <button className="btn-copy" onClick={copyFriendCode} title="Copy code">
                <FiCopy />
              </button>
            </div>
            <span className="friend-code-hint">Share this code for others to add you</span>
          </div>
        </div>

        <form className="friend-code-card add-code" onSubmit={handleSendRequestByCode}>
          <div className="friend-code-icon">
            <FiUserPlus />
          </div>
          <div className="friend-code-content">
            <span className="friend-code-label">Add by Friend Code</span>
            <div className="friend-code-input">
              <input
                type="text"
                placeholder="Enter friend code..."
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button type="submit" className="btn-add-code" disabled={addingByCode || !friendCode.trim()}>
                {addingByCode ? 'Adding...' : 'Add Friend'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
          <FiUsers />
          <span>Friends</span>
          <span className="tab-count">{friends.length}</span>
        </button>
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          <FiClock />
          <span>Pending</span>
          {pending.length > 0 && <span className="tab-count pending">{pending.length}</span>}
        </button>
        <button className={`tab ${tab === 'find' ? 'active' : ''}`} onClick={() => setTab('find')}>
          <FiSearch />
          <span>Find People</span>
        </button>
      </div>

      {tab === 'friends' && (
        <div className="user-list">
          {friends.map((f) => (
            <div key={f.id} className="user-card">
              <div className="user-avatar">{(f.friendUsername || f.username || '?')[0].toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{f.friendId === user.id ? f.username : f.friendUsername}</span>
                <span className="user-status accepted">
                  <FiCheck /> Friends
                </span>
              </div>
              <button className="btn-sm btn-danger" onClick={() => handleRemove(f.id)} title="Remove friend">
                <FiTrash2 />
              </button>
            </div>
          ))}
          {friends.length === 0 && (
            <div className="empty-state">
              <FiUsers />
              <span>No friends yet</span>
              <p>Send a friend request or share your friend code!</p>
            </div>
          )}
        </div>
      )}

      {tab === 'pending' && (
        <div className="user-list">
          {pending.map((f) => (
            <div key={f.id} className="user-card">
              <div className="user-avatar">{(f.userId === user.id ? f.friendUsername : f.username)[0].toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{f.userId === user.id ? f.friendUsername : f.username}</span>
                <span className="user-status pending">
                  <FiClock /> {f.userId === user.id ? 'Request sent' : 'Incoming request'}
                </span>
              </div>
              {f.friendId === user.id && (
                <div className="card-actions">
                  <button className="btn-sm btn-join" onClick={() => handleAccept(f.id)}>
                    <FiCheck /> Accept
                  </button>
                  <button className="btn-sm btn-danger" onClick={() => handleReject(f.id)}>
                    <FiXCircle />
                  </button>
                </div>
              )}
            </div>
          ))}
          {pending.length === 0 && (
            <div className="empty-state">
              <FiClock />
              <span>No pending requests</span>
            </div>
          )}
        </div>
      )}

      {tab === 'find' && (
        <>
          <div className="search-bar">
            <FiSearch />
            <input type="text" placeholder="Search by username or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="user-list">
            {filteredUsers.map((u) => (
              <div key={u.id} className="user-card">
                <div className="user-avatar">{u.username[0].toUpperCase()}</div>
                <div className="user-info">
                  <span className="user-name">{u.username}</span>
                  <span className="user-meta">{u.firstName} {u.lastName}</span>
                </div>
                <button className="btn-sm btn-join" onClick={() => handleSendRequest(u.id)}>
                  <FiUserPlus /> Add
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <FiSearch />
                <span>No users found</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
