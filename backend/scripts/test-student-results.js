/* Simple test script to verify /api/quizzes/student/results and /api/quizzes/:id/student-results */
(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const headers = { 'Content-Type': 'application/json' };
    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: 'student@example.com', password: 'student123' })
    });
    const loginBody = await loginRes.json();
    console.log('login status:', loginRes.status, 'role:', loginBody.user?.role);
    const token = loginBody.token;
    if (!token) {
      throw new Error('No token returned from login');
    }
    const authHeaders = { Authorization: `Bearer ${token}` };
    const verifyRes = await fetch(base + '/auth/verify', { headers: authHeaders });
    console.log('verify status:', verifyRes.status, 'body:', await verifyRes.text());

    // List results
    const resultsRes = await fetch(base + '/quizzes/student/results', { headers: authHeaders });
    const resultsText = await resultsRes.text();
    console.log('results status:', resultsRes.status);
    console.log('results body:', resultsText);

    // If OK, parse and fetch detailed result for first quiz
    if (resultsRes.ok) {
      try {
        const resultsJson = JSON.parse(resultsText);
        const first = Array.isArray(resultsJson?.results) && resultsJson.results.length > 0 ? resultsJson.results[0] : null;
        if (first?.quiz_id) {
          const detailUrl = `${base}/quizzes/${first.quiz_id}/student-results`;
          const detailRes = await fetch(detailUrl, { headers: authHeaders });
          const detailText = await detailRes.text();
          console.log('detail status:', detailRes.status, 'url:', detailUrl);
          console.log('detail body:', detailText);
          if (!detailRes.ok) process.exit(1);
        } else {
          console.log('No quiz results available to fetch detailed result.');
        }
      } catch (e) {
        console.error('Parse results JSON failed:', e);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  } catch (e) {
    console.error('Test error:', e);
    process.exit(1);
  }
})();