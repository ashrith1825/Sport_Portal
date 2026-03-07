import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContextObject';
import { getMe, updateMe } from '../../api/services';
import { FiSave, FiUser, FiCopy, FiHash, FiMail, FiPhone, FiEdit3 } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => setProfile(res.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMe(profile);
      setProfile(res.data);
      setUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const copyFriendCode = () => {
    if (profile?.friendCode) {
      navigator.clipboard.writeText(profile.friendCode);
      toast.success('Friend code copied!');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" />
            ) : (
              <span>{(profile.username || '?')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="profile-info">
            <h1>{profile.firstName || profile.username} {profile.lastName || ''}</h1>
            <p className="profile-username">@{profile.username}</p>
            <span className="profile-role">{profile.role?.replace('ROLE_', '')}</span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <FiMail />
            <span>{profile.email}</span>
          </div>
          {profile.phone && (
            <div className="stat-item">
              <FiPhone />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        {/* Friend Code Display */}
        <div className="friend-code-display">
          <div className="friend-code-label">
            <FiHash />
            <span>Your Friend Code</span>
          </div>
          <div className="friend-code-box">
            <span className="code">{profile.friendCode || 'N/A'}</span>
            <button className="btn-copy" onClick={copyFriendCode} title="Copy code">
              <FiCopy />
            </button>
          </div>
          <p className="friend-code-hint">Share this code with friends to connect</p>
        </div>

        {profile.bio && (
          <div className="profile-bio">
            <p>{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="profile-edit">
        <h2><FiEdit3 /> Edit Profile</h2>
        <form className="profile-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input value={profile.firstName || ''} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder="Your first name" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input value={profile.lastName || ''} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder="Your last name" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input value={profile.username || ''} disabled className="input-disabled" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={profile.email || ''} disabled className="input-disabled" />
            </div>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Your phone number" />
          </div>

          <div className="form-group">
            <label>Avatar URL</label>
            <input value={profile.avatarUrl || ''} onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea rows={4} value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
