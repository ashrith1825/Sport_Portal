function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function toId(value) {
  return value ? value.toString() : null;
}

function mapIds(list = []) {
  return list.map((item) => toId(item?._id ?? item));
}

export function toUserDto(user) {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : user;
  return {
    id: toId(doc._id ?? doc.id),
    username: doc.username,
    email: doc.email,
    friendCode: doc.friendCode,
    firstName: doc.firstName || '',
    lastName: doc.lastName || '',
    phone: doc.phone || '',
    avatarUrl: doc.avatarUrl || '',
    bio: doc.bio || '',
    role: doc.role,
    active: Boolean(doc.active),
    joinedClubs: mapIds(doc.joinedClubs || []),
    joinedTeams: mapIds(doc.joinedTeams || []),
    joinedEvents: mapIds(doc.joinedEvents || []),
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export function toClubDto(club) {
  if (!club) return null;
  const doc = club.toObject ? club.toObject() : club;
  return {
    id: toId(doc._id ?? doc.id),
    name: doc.name,
    description: doc.description || '',
    sportType: doc.sportType,
    logoUrl: doc.logoUrl || '',
    ownerId: toId(doc.owner?._id ?? doc.ownerId ?? doc.owner),
    ownerUsername: doc.owner?.username || doc.ownerUsername || '',
    memberCount: Number(doc.memberCount ?? doc.members?.length ?? 0),
    teamCount: Number(doc.teamCount ?? doc.teams?.length ?? 0),
    memberIds: mapIds(doc.members || []),
    members: (doc.members || [])
      .filter((member) => member && typeof member === 'object' && member.username)
      .map((member) => ({
        id: toId(member._id ?? member.id),
        username: member.username,
        firstName: member.firstName || '',
        lastName: member.lastName || '',
      })),
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export function toEventDto(event) {
  if (!event) return null;
  const doc = event.toObject ? event.toObject() : event;
  return {
    id: toId(doc._id ?? doc.id),
    title: doc.title,
    description: doc.description || '',
    sportType: doc.sportType,
    location: doc.location,
    latitude: doc.latitude != null ? Number(doc.latitude) : null,
    longitude: doc.longitude != null ? Number(doc.longitude) : null,
    eventDate: toIso(doc.eventDate),
    endDate: toIso(doc.endDate),
    maxParticipants: doc.maxParticipants != null ? Number(doc.maxParticipants) : null,
    status: doc.status,
    organizerId: toId(doc.organizer?._id ?? doc.organizerId ?? doc.organizer),
    organizerUsername: doc.organizer?.username || doc.organizerUsername || '',
    participantCount: Number(doc.participantCount ?? doc.participants?.length ?? 0),
    participantIds: mapIds(doc.participants || []),
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export function toTeamDto(team) {
  if (!team) return null;
  const doc = team.toObject ? team.toObject() : team;
  return {
    id: toId(doc._id ?? doc.id),
    name: doc.name,
    description: doc.description || '',
    clubId: toId(doc.club?._id ?? doc.clubId ?? doc.club),
    clubName: doc.club?.name || doc.clubName || '',
    sportType: doc.club?.sportType || doc.sportType || '',
    clubOwnerId: toId(doc.club?.owner?._id ?? doc.club?.owner ?? doc.clubOwnerId),
    captainId: doc.captain ? toId(doc.captain._id ?? doc.captain) : null,
    captainUsername: doc.captain?.username || doc.captainUsername || '',
    memberCount: Number(doc.memberCount ?? doc.members?.length ?? 0),
    memberIds: mapIds(doc.members || []),
    members: (doc.membersPopulated || doc.members || []).map((member) => toUserDto(member)),
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export function toFriendshipDto(friendship) {
  if (!friendship) return null;
  const doc = friendship.toObject ? friendship.toObject() : friendship;
  return {
    id: toId(doc._id ?? doc.id),
    userId: toId(doc.user?._id ?? doc.userId ?? doc.user),
    friendId: toId(doc.friend?._id ?? doc.friendId ?? doc.friend),
    username: doc.user?.username || doc.username || '',
    friendUsername: doc.friend?.username || doc.friendUsername || '',
    status: doc.status,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

export function toJournalDto(journal) {
  if (!journal) return null;
  const doc = journal.toObject ? journal.toObject() : journal;
  const author = doc.author && typeof doc.author === 'object' ? doc.author : null;
  const authorName = [author?.firstName, author?.lastName].filter(Boolean).join(' ').trim();
  return {
    id: toId(doc._id ?? doc.id),
    title: doc.title,
    content: doc.content,
    sportType: doc.sportType,
    imageUrl: doc.imageUrl || '',
    authorId: toId(author?._id ?? doc.authorId ?? doc.author),
    authorUsername: author?.username || doc.authorUsername || '',
    authorDisplayName: authorName || author?.username || doc.authorUsername || 'Unknown author',
    authorAvatarUrl: author?.avatarUrl || '',
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}