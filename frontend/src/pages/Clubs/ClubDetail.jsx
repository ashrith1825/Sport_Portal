import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import {
  getClub,
  getClubRequests,
  getTeamsByClub,
  getTeamRequests,
  decisionClubRequest,
  approveTeamRequest,
  createTeam,
} from '../../api/services';
import ClubChat from '../../components/ClubChat/ClubChat';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiUsers, FiLayers, FiCheck, FiX, FiMessageSquare, FiShield } from 'react-icons/fi';
import { countLabel } from '../../utils/countLabel';
import './ClubDetail.css';

export default function ClubDetail() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [teams, setTeams] = useState([]);
  const [clubRequests, setClubRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [activePanel, setActivePanel] = useState('chat');

  const clubAdminId = club?.ownerId || club?.owner?._id || club?.owner;
  const isClubAdmin = !!user && String(clubAdminId) === String(user.id || user._id);
  const clubMemberIds = Array.isArray(club?.memberIds) ? club.memberIds : [];
  const isClubMember = !!user && (clubMemberIds.some((id) => String(id) === String(user.id || user._id)) || isClubAdmin);
  const teamCaptainIds = useMemo(
    () => new Set((teams || []).filter((team) => String(team.captainId) === String(user?.id || user?._id)).map((team) => team.id || team._id)),
    [teams, user]
  );
  const canReviewRequests = isClubAdmin || teamCaptainIds.size > 0;

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
      const currentUserId = user?.id || user?._id;
      const nextClubAdmin = String(nextClub.ownerId) === String(currentUserId);
      const nextRequests = nextClubAdmin ? (await getClubRequests(clubId)).data || [] : [];
      setClub(nextClub);
      setTeams(nextTeams);
      setClubRequests(nextRequests);

      if (nextTeams.length) {
        const teamRequestEntries = await Promise.all(
          nextTeams
            .filter((team) => nextClubAdmin || String(team.captainId) === String(currentUserId))
            .map(async (team) => {
              const res = await getTeamRequests(team.id || team._id);
              return [team.id || team._id, res.data || []];
            })
        );
        setTeamRequests(Object.fromEntries(teamRequestEntries));
      } else {
        setTeamRequests({});
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load club');
    } finally {
      setLoading(false);
    }
  }, [clubId, user]);

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in to create a team');
    if (!clubId) return;
    try {
      await createTeam({ clubId, name: teamForm.name, description: teamForm.description });
      toast.success('Team creation requested');
      setTeamForm({ name: '', description: '' });
      setShowCreateTeam(false);
      await loadClubData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create team');
    }
  };

  const handleClubRequestDecision = async (requestId, decision) => {
    try {
      await decisionClubRequest(requestId, decision);
      toast.success(decision === 'APPROVED' ? 'Request approved' : 'Request rejected');
      await loadClubData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update request');
    }
  };

  const handleTeamRequestDecision = async (requestId, decision) => {
    try {
      await approveTeamRequest(requestId, decision);
      toast.success(decision === 'APPROVED' ? 'Team request approved' : 'Team request rejected');
      await loadClubData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update team request');
    }
  };

  const allPendingTeamRequests = Object.entries(teamRequests).flatMap(([teamId, requests]) =>
    (requests || []).map((request) => ({ ...request, teamId, teamName: (teams.find((team) => String(team.id || team._id) === String(teamId)) || {}).name || 'Team' }))
  );

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
      <div className="club-detail-topbar">
        <button className="btn-secondary" onClick={() => navigate('/clubs')}>
          <FiArrowLeft /> Back to clubs
        </button>
      </div>

      <div className="club-detail-layout">
        <section className="club-detail-main">
          <div className="club-detail-header-block">
            <div className="club-detail-heading-row">
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
              {isClubMember && (
                <button className="btn-primary" onClick={() => setShowCreateTeam((current) => !current)}>
                  <FiPlus /> Create Team
                </button>
              )}
            </div>

            {showCreateTeam && isClubMember && (
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
                  <button type="submit" className="btn-primary">Submit request</button>
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
                    {team.captainId && String(team.captainId) === String(user?.id || user?._id) && (
                      <span className="role-badge role-owner">Captain</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="club-detail-panel">
          {canReviewRequests ? (
            <div className="panel-tabs">
              <button className={activePanel === 'chat' ? 'active' : ''} onClick={() => setActivePanel('chat')}>
                <FiMessageSquare /> Chat
              </button>
              <button className={activePanel === 'requests' ? 'active' : ''} onClick={() => setActivePanel('requests')}>
                <FiShield /> Requests
              </button>
            </div>
          ) : null}

          {activePanel === 'chat' ? (
            <ClubChat clubId={clubId} open={true} />
          ) : (
            <div className="requests-panel">
              <h3>Pending requests</h3>

              {clubRequests.length === 0 && allPendingTeamRequests.length === 0 ? (
                <p className="muted-text">No pending requests.</p>
              ) : null}

              {clubRequests.length > 0 && (
                <div className="request-group">
                  <h4>Club requests</h4>
                  {clubRequests.map((request) => (
                    <div key={request._id || request.id} className="request-item">
                      <div>
                        <strong>{request.user?.username || 'Member'}</strong>
                        <p>{(request.type || 'CLUB').replace(/_/g, ' ').toLowerCase()}</p>
                      </div>
                      <div className="request-actions">
                        <button className="btn-sm btn-success" onClick={() => handleClubRequestDecision(request._id || request.id, 'APPROVED')}>
                          <FiCheck /> Approve
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleClubRequestDecision(request._id || request.id, 'REJECTED')}>
                          <FiX /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {allPendingTeamRequests.length > 0 && (
                <div className="request-group">
                  <h4>Team requests</h4>
                  {allPendingTeamRequests.map((request) => (
                    <div key={request._id || request.id} className="request-item">
                      <div>
                        <strong>{request.user?.username || 'Member'}</strong>
                        <p>{request.teamName} • {(request.type || 'TEAM').replace(/_/g, ' ').toLowerCase()}</p>
                      </div>
                      <div className="request-actions">
                        <button className="btn-sm btn-success" onClick={() => handleTeamRequestDecision(request._id || request.id, 'APPROVED')}>
                          <FiCheck /> Approve
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleTeamRequestDecision(request._id || request.id, 'REJECTED')}>
                          <FiX /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
