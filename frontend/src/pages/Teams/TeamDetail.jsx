import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTeam, getTeam, removeTeamMember, transferTeamLeadership } from '../../api/services';
import { useAuth } from '../../context/AuthContextObject';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiTrash2, FiUserMinus, FiUserPlus } from 'react-icons/fi';
import { countLabel } from '../../utils/countLabel';
import './TeamDetail.css';

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const userId = user?.id || user?._id;
  const captainId = team?.captainId;
  const clubOwnerId = team?.club?.ownerId || team?.clubOwnerId;
  const isCaptain = !!userId && String(captainId) === String(userId);
  const isClubAdmin = !!userId && String(clubOwnerId) === String(userId);

  const loadTeam = useCallback(async () => {
    try {
      const response = await getTeam(teamId);
      setTeam(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this team?`)) return;
    setBusy(true);
    try {
      await removeTeamMember(teamId, memberId);
      toast.success('Team member removed');
      await loadTeam();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove member');
    } finally {
      setBusy(false);
    }
  };

  const handleTransfer = async (memberId, memberName) => {
    if (!window.confirm(`Make ${memberName} the new team captain?`)) return;
    setBusy(true);
    try {
      await transferTeamLeadership(teamId, memberId);
      toast.success('Team leadership transferred');
      await loadTeam();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to transfer leadership');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this entire team? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteTeam(teamId);
      toast.success('Team deleted');
      navigate(team?.clubId ? `/clubs/${team.clubId}` : '/clubs');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete team');
      setBusy(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!team) return <div className="page team-detail-page"><div className="empty-state">Team not found.</div></div>;

  return (
    <div className="page team-detail-page">
      <div className="team-detail-topbar">
        <button className="btn-secondary" onClick={() => navigate(team.clubId ? `/clubs/${team.clubId}` : '/clubs')}>
          <FiArrowLeft /> Back to club
        </button>
        {isClubAdmin && (
          <button className="btn-danger" onClick={handleDelete} disabled={busy}>
            <FiTrash2 /> Delete team
          </button>
        )}
      </div>

      <div className="team-detail-card">
        <div className="team-detail-heading">
          <span className="sport-badge">{team.sportType || 'Sport'}</span>
          <h1>{team.name}</h1>
          <p>{team.description || 'No team description yet.'}</p>
          <Link className="club-link" to={team.clubId ? `/clubs/${team.clubId}` : '/clubs'}>{team.clubName || 'Club'}</Link>
        </div>

        <div className="team-detail-meta">
          <span>Captain: <strong>{team.captainUsername || 'Unassigned'}</strong></span>
          <span>{countLabel(team.memberCount, 'member')}</span>
        </div>

        <section className="team-members-section">
          <div className="section-heading-row">
            <h2>Team members</h2>
            {isCaptain && <span className="role-badge role-owner">You are captain</span>}
          </div>
          <div className="team-members-list">
            {(team.members || []).map((member) => {
              const memberId = member.id || member._id;
              const memberIsCaptain = String(memberId) === String(team.captainId);
              return (
                <article className="team-member-row" key={memberId}>
                  <div className="team-member-avatar">{(member.username || '?')[0].toUpperCase()}</div>
                  <div className="team-member-info">
                    <strong>{member.username}</strong>
                    <span>{member.firstName} {member.lastName}</span>
                  </div>
                  {memberIsCaptain && <span className="captain-badge"><FiCheck /> Captain</span>}
                  {(isCaptain || isClubAdmin) && !memberIsCaptain && (
                    <div className="team-member-actions">
                      {isCaptain && (
                        <button className="btn-sm btn-secondary" onClick={() => handleTransfer(memberId, member.username)} disabled={busy}>
                          <FiUserPlus /> Make captain
                        </button>
                      )}
                      <button className="btn-sm btn-danger" onClick={() => handleRemove(memberId, member.username)} disabled={busy} aria-label={`Remove ${member.username}`}>
                        <FiUserMinus /> Remove
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}