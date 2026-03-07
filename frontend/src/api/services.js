import API from './axios';

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// Users
export const getMe = () => API.get('/users/me');
export const updateMe = (data) => API.put('/users/me', data);
export const getUser = (id) => API.get(`/users/${id}`);
export const getAllUsers = () => API.get('/users');

// Clubs
export const getClubs = () => API.get('/clubs');
export const getClub = (id) => API.get(`/clubs/${id}`);
export const getClubsBySport = (sport) => API.get(`/clubs/sport/${sport}`);
export const searchClubs = (keyword) => API.get(`/clubs/search?keyword=${keyword}`);
export const getMyClubs = () => API.get('/clubs/my');
export const createClub = (data) => API.post('/clubs', data);
export const updateClub = (id, data) => API.put(`/clubs/${id}`, data);
export const deleteClub = (id) => API.delete(`/clubs/${id}`);
export const joinClub = (id) => API.post(`/clubs/${id}/join`);
export const leaveClub = (id) => API.post(`/clubs/${id}/leave`);

// Events
export const getEvents = () => API.get('/events');
export const getUpcomingEvents = () => API.get('/events/upcoming');
export const getEvent = (id) => API.get(`/events/${id}`);
export const getEventsBySport = (sport) => API.get(`/events/sport/${sport}`);
export const searchEvents = (keyword) => API.get(`/events/search?keyword=${keyword}`);
export const getMyEvents = () => API.get('/events/my');
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const joinEvent = (id) => API.post(`/events/${id}/join`);
export const leaveEvent = (id) => API.post(`/events/${id}/leave`);

// Teams
export const getTeamsByClub = (clubId) => API.get(`/teams/club/${clubId}`);
export const getTeam = (id) => API.get(`/teams/${id}`);
export const createTeam = (data) => API.post('/teams', data);
export const addTeamMember = (teamId, userId) => API.post(`/teams/${teamId}/members/${userId}`);
export const removeTeamMember = (teamId, userId) => API.delete(`/teams/${teamId}/members/${userId}`);
export const deleteTeam = (id) => API.delete(`/teams/${id}`);

// Friends
export const sendFriendRequest = (friendId) => API.post(`/friends/request/${friendId}`);
export const sendFriendRequestByCode = (friendCode) => API.post(`/friends/request/code/${friendCode}`);
export const acceptFriendRequest = (id) => API.put(`/friends/accept/${id}`);
export const rejectFriendRequest = (id) => API.put(`/friends/reject/${id}`);
export const getFriends = () => API.get('/friends');
export const getPendingRequests = () => API.get('/friends/pending');
export const removeFriend = (id) => API.delete(`/friends/${id}`);

// Journals
export const getJournals = () => API.get('/journals');
export const getJournal = (id) => API.get(`/journals/${id}`);
export const getJournalsBySport = (sport) => API.get(`/journals/sport/${sport}`);
export const searchJournals = (keyword) => API.get(`/journals/search?keyword=${keyword}`);
export const getMyJournals = () => API.get('/journals/my');
export const createJournal = (data) => API.post('/journals', data);
export const updateJournal = (id, data) => API.put(`/journals/${id}`, data);
export const deleteJournal = (id) => API.delete(`/journals/${id}`);
