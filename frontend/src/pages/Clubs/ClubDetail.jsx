import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import {
  getClub,
  getTeamsByClub,
  createTeam,
  joinTeam,
  removeClubMember,
} from '../../api/services';
import ClubChat from '../../components/ClubChat/ClubChat';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiPlus, FiUsers, FiLayers, FiUserMinus } from 'react-icons/fi';
import SportIcon from '../../components/SportIcon';
import { inferSportIcon } from '../../utils/sportIcons';
import { countLabel } from '../../utils/countLabel';
import './ClubDetail.css';

export default function ClubDetail() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });

  const clubAdminId = club?.ownerId || club?.owner?._id || club?.owner;
  const isClubAdmin = !!user && String(clubAdminId) === String(user.id || user._id);
  const loadClubData = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const [clubRes, teamRes] = await Promise.all([
        getClub(clubId),
        getTeamsByClub(clubId),
      ]);

      const nextClub = clubRes.data;
      const nextTeams = teamRes.data || [];
      setClub(nextClub);
      setTeams(nextTeams);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load club');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in to create a team');
    if (!clubId) return;
    try {
      await createTeam({ clubId, name: teamForm.name, description: teamForm.description });
      toast.success('Team created');
      setTeamForm({ name: '', description: '' });
      setShowCreateTeam(false);
      await loadClubData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create team');
    }
  };

  const handleTeamJoin = async (teamId) => {
    if (!user) return toast.error('Please log in to join a team');
    try {
      await joinTeam(teamId);
      toast.success('You joined the team');
      await loadClubData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to join team');
    }
  };

  const handleRemoveClubMember = async (memberId, username) => {
    if (!window.confirm(`Remove ${username} from this club and its teams?`)) return;
    try {
      await removeClubMember(clubId, memberId);
      toast.success('Club member removed');
      await loadClubData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove club member');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!club) {
    return (
      <div className="page club-detail-page">
        <div className="empty-state">Club not found.</div>
      </div>
    );
  }

  return (
    <div className="page club-detail-page">
      <div className="club-detail-layout">
        <section className="club-detail-main">
          <div className="club-detail-header-block">
            <div className="club-detail-heading-row">
              <span className="club-detail-sport-icon" aria-hidden="true">
                <SportIcon name={club.sportIcon || inferSportIcon(club.sportType)} />
              </span>
              <span className="sport-badge">{club.sportType}</span>
            </div>
            <h1>{club.name}</h1>
            <p>{club.description || 'This club has no description yet.'}</p>
            <div className="club-detail-meta-row">
              <span><FiUsers /> {countLabel(club.memberCount, 'member')}</span>
              <span><FiLayers /> {countLabel(club.teamCount, 'team')}</span>
            </div>
          </div>

          <div className="club-detail-section">
            <div className="section-heading-row">
              <h2>Teams</h2>
              {user && (
                <button className="btn-primary" onClick={() => setShowCreateTeam((current) => !current)}>
                  <FiPlus /> Create Team
                </button>
              )}
            </div>

            {showCreateTeam && user && (
              <form className="team-create-form" onSubmit={handleCreateTeam}>
                <div className="form-group">
                  <label>Team name</label>
                  <input
                    value={teamForm.name}
                    onChange={(e) => setTeamForm((current) => ({ ...current, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={teamForm.description}
                    onChange={(e) => setTeamForm((current) => ({ ...current, description: e.target.value }))}
                  />
                </div>
                <div className="team-create-actions">
                  <button type="submit" className="btn-primary">Create Team</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateTeam(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="team-list">
              {teams.length === 0 ? (
                <div className="empty-state small">No teams yet for this club.</div>
              ) : (
                teams.map((team) => (
                  <div key={team.id || team._id} className="team-row">
                    <div>
                      <Link className="team-name-link" to={`/teams/${team.id || team._id}`}><strong>{team.name}</strong></Link>
                      <small>{team.captainUsername || 'Captain'} • {countLabel(team.memberCount, 'member')}</small>
                    </div>
                    <div className="team-row-actions">
                      {team.captainId && String(team.captainId) === String(user?.id || user?._id) && (
                        <span className="role-badge role-owner">Captain</span>
                      )}
                      {user && !team.memberIds?.some((id) => String(id) === String(user.id || user._id)) && (
                        <button
                          className="btn-sm btn-join"
                          onClick={() => handleTeamJoin(team.id || team._id)}
                        >
                          <FiUsers /> Join team
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="club-detail-section">
            <div className="section-heading-row">
              <h2>Club members</h2>
              <span>{club.memberCount}</span>
            </div>
            <div className="club-members-list">
              {(club.members || []).map((member) => (
                <div className="club-member-row" key={member.id}>
                  <div>
                    <strong>{member.username}</strong>
                    <small>{member.id === clubAdminId ? 'Club admin' : `${member.firstName} ${member.lastName}`}</small>
                  </div>
                  {isClubAdmin && member.id !== clubAdminId && (
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleRemoveClubMember(member.id, member.username)}
                      aria-label={`Remove ${member.username} from club`}
                    >
                      <FiUserMinus /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="club-detail-panel">
          <ClubChat clubId={clubId} open={true} />
        </aside>
      </div>
    </div>
  );
}
