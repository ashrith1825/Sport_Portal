import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getClubs, getTeamsByClub, createTeam, deleteTeam, addTeamMember, removeTeamMember, getAllUsers } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import { FiPlus, FiUsers, FiTrash2, FiX, FiUserPlus, FiUserMinus, FiChevronDown, FiChevronUp, FiShield } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import './Teams.css';

export default function Teams() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', clubId: '' });

  const fetchClubs = async () => {
    try {
      const res = await getClubs();
      setClubs(res.data);
      
      // Auto-select club from URL or first club
      const clubIdFromUrl = searchParams.get('clubId');
      if (clubIdFromUrl) {
        const club = res.data.find(c => c.id === parseInt(clubIdFromUrl));
        if (club) {
          setSelectedClub(club);
          await fetchTeams(club.id);
        }
      }
    } catch {
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (clubId) => {
    try {
      const res = await getTeamsByClub(clubId);
      setTeams(res.data);
    } catch {
      toast.error('Failed to load teams');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch {
      console.error('Failed to load users');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getClubs();
        setClubs(res.data);
        
        // Auto-select club from URL or first club
        const clubIdFromUrl = searchParams.get('clubId');
        if (clubIdFromUrl) {
          const club = res.data.find(c => c.id === parseInt(clubIdFromUrl));
          if (club) {
            setSelectedClub(club);
            const teamsRes = await getTeamsByClub(club.id);
            setTeams(teamsRes.data);
          }
        }
      } catch {
        toast.error('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    fetchUsers();
  }, [searchParams]);

  const handleClubSelect = async (club) => {
    setSelectedClub(club);
    setLoading(true);
    await fetchTeams(club.id);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedClub) {
      toast.error('Please select a club first');
      return;
    }
    try {
      await createTeam({ ...form, clubId: selectedClub.id });
      toast.success('Team created!');
      setShowModal(false);
      setForm({ name: '', description: '', clubId: '' });
      await fetchTeams(selectedClub.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return;
    try {
      await deleteTeam(id);
      toast.success('Team deleted');
      await fetchTeams(selectedClub.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAddMember = async (teamId, userId) => {
    try {
      await addTeamMember(teamId, userId);
      toast.success('Member added!');
      await fetchTeams(selectedClub.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await removeTeamMember(teamId, userId);
      toast.success('Member removed');
      await fetchTeams(selectedClub.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading && clubs.length === 0) return <LoadingSpinner />;

  return (
    <div className="teams-page">
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <p className="page-subtitle">Manage teams within your clubs</p>
        </div>
        {selectedClub && user && selectedClub.ownerId === user.id && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Create Team
          </button>
        )}
      </div>

      {/* Club Selector */}
      <div className="club-selector">
        <span className="selector-label">Select a Club:</span>
        <div className="club-chips">
          {clubs.map((club) => (
            <button
              key={club.id}
              className={`club-chip ${selectedClub?.id === club.id ? 'active' : ''}`}
              onClick={() => handleClubSelect(club)}
            >
              <FiShield />
              <span>{club.name}</span>
            </button>
          ))}
          {clubs.length === 0 && <span className="no-clubs">No clubs available. Join or create a club first.</span>}
        </div>
      </div>

      {/* Teams List */}
      {selectedClub && (
        <div className="teams-list">
          <div className="section-header">
            <h2>Teams in {selectedClub.name}</h2>
            <span className="team-count">{teams.length} teams</span>
          </div>

          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <div className="team-header" onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}>
                <div className="team-info">
                  <h3 className="team-name">{team.name}</h3>
                  <p className="team-desc">{team.description || 'No description'}</p>
                  <div className="team-meta">
                    <span><FiUsers /> {team.memberCount || 0} members</span>
                    <span>Captain: {team.captainUsername}</span>
                  </div>
                </div>
                <div className="team-actions">
                  {user && selectedClub.ownerId === user.id && (
                    <button className="btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(team.id); }}>
                      <FiTrash2 />
                    </button>
                  )}
                  <button className="btn-sm btn-secondary">
                    {expandedTeam === team.id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              </div>

              {expandedTeam === team.id && (
                <div className="team-expanded">
                  <div className="members-section">
                    <h4>Team Members</h4>
                    <div className="members-list">
                      {team.members && team.members.length > 0 ? (
                        team.members.map((member) => (
                          <div key={member.id} className="member-item">
                            <div className="member-avatar">{member.username[0].toUpperCase()}</div>
                            <span className="member-name">{member.username}</span>
                            {member.id === team.captainId && <span className="captain-badge">Captain</span>}
                            {user && (selectedClub.ownerId === user.id || team.captainId === user.id) && member.id !== team.captainId && (
                              <button className="btn-icon" onClick={() => handleRemoveMember(team.id, member.id)}>
                                <FiUserMinus />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="no-members">No members yet</p>
                      )}
                    </div>
                  </div>

                  {user && (selectedClub.ownerId === user.id || team.captainId === user.id) && (
                    <div className="add-member-section">
                      <h4>Add Member</h4>
                      <div className="add-member-list">
                        {users
                          .filter(u => !team.members?.some(m => m.id === u.id))
                          .slice(0, 5)
                          .map((u) => (
                            <button key={u.id} className="add-member-btn" onClick={() => handleAddMember(team.id, u.id)}>
                              <div className="member-avatar small">{u.username[0].toUpperCase()}</div>
                              <span>{u.username}</span>
                              <FiUserPlus />
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {teams.length === 0 && (
            <div className="empty-state">
              <FiUsers />
              <span>No teams in this club yet</span>
              {user && selectedClub.ownerId === user.id && <p>Create a team to get started!</p>}
            </div>
          )}
        </div>
      )}

      {!selectedClub && clubs.length > 0 && (
        <div className="empty-state">
          <FiShield />
          <span>Select a club to view its teams</span>
        </div>
      )}

      {/* Create Team Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Team</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Team Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-info">
                <span>Club: {selectedClub?.name}</span>
              </div>
              <button type="submit" className="btn-primary">Create Team</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
