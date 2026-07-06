const API = 'http://localhost:8080/api';

async function getJson(path, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

async function main() {
  console.log('Checking public endpoints...');
  const clubs = await getJson('/clubs');
  console.log('Public clubs:', Array.isArray(clubs) ? clubs.length : clubs);
  const events = await getJson('/events');
  console.log('Public events:', Array.isArray(events) ? events.length : events);
  const journals = await getJson('/journals');
  console.log('Public journals:', Array.isArray(journals) ? journals.length : journals);

  console.log('\nLogging in as sportdemo...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'sportdemo', password: 'Demo@12345' }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson?.token) {
    console.error('Login failed or token missing:', loginJson);
    process.exit(1);
  }
  const token = loginJson.token;
  console.log('Token length:', token.length);

  const myClubs = await getJson('/clubs/my', token);
  console.log('My clubs:', Array.isArray(myClubs) ? myClubs.length : myClubs);
  const myEvents = await getJson('/events/my', token);
  console.log('My events:', Array.isArray(myEvents) ? myEvents.length : myEvents);
  const myJournals = await getJson('/journals/my', token);
  console.log('My journals:', Array.isArray(myJournals) ? myJournals.length : myJournals);
}

main().catch((e) => {
  console.error('Error during check:', e);
  process.exit(1);
});
