import fetch from 'node-fetch';

async function run() {
  const base = 'http://127.0.0.1:8080/api';

  // Login demo
  const login = await (await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'sportdemo', password: 'Demo@12345' })
  })).json();
  console.log('demo login', login.id);
  const demoToken = login.token;

  // Post club message
  const clubId = '6a4bc5809bd65e1882567bcb';
  const postRes = await fetch(`${base}/messages/clubs/${clubId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + demoToken },
    body: JSON.stringify({ text: 'Automated test club message' })
  });
  const post = await postRes.json();
  console.log('posted message id', post._id);

  // Get messages
  const msgs = await (await fetch(`${base}/messages/clubs/${clubId}`)).json();
  console.log('messages count', msgs.length);

  // Delete message
  const del = await (await fetch(`${base}/messages/clubs/${post._id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + demoToken } })).json();
  console.log('deleted', del.success || del);

  // Register tester
  const reg = await (await fetch(`${base}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'tester2', email: 'tester2@example.local', password: 'Test@12345' })
  })).json();
  console.log('tester2 id', reg.id);
  const testerToken = reg.token;
  const testerId = reg.id;

  // Tester send friend request by code
  const friendReq = await fetch(`${base}/friends/request/code/SPORTDEM`, { method: 'POST', headers: { Authorization: 'Bearer ' + testerToken } });
  console.log('friend request status', friendReq.status);

  // Demo accept
  const pending = await (await fetch(`${base}/friends/pending`, { headers: { Authorization: 'Bearer ' + demoToken } })).json();
  console.log('pending count', pending.length);
  if (pending.length) {
    const accept = await (await fetch(`${base}/friends/accept/${pending[0].id}`, { method: 'PUT', headers: { Authorization: 'Bearer ' + demoToken } })).json();
    console.log('accept result', accept.message || accept);
  }

  // Direct message demo -> tester
  const dm = await (await fetch(`${base}/messages/direct/${testerId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + demoToken },
    body: JSON.stringify({ text: 'Hello from demo via test script' })
  })).json();
  console.log('direct message id', dm._id);

  const dmList = await (await fetch(`${base}/messages/direct/${login.id}`, { headers: { Authorization: 'Bearer ' + testerToken } })).json();
  console.log('dm list length', dmList.length);
}

run().catch((e) => { console.error(e); process.exit(1); });
