/* Debug script to check student results API response structure */
// Using built-in fetch (Node.js 18+)

(async () => {
  try {
    const base = 'http://localhost:5000/api';
    
    // Try to login with a test user
    console.log('Testing login...');
    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed, trying alternative credentials...');
      // Try different credentials
      const altLoginRes = await fetch(base + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
      });
      
      if (!altLoginRes.ok) {
        console.log('Alternative login also failed. Response:', await altLoginRes.text());
        return;
      }
      
      const altLoginBody = await altLoginRes.json();
      console.log('Alternative login successful:', altLoginBody);
      
      if (!altLoginBody.token) {
        console.log('No token in response');
        return;
      }
      
      // Test with admin token
      const authHeaders = { Authorization: `Bearer ${altLoginBody.token}` };
      const resultsRes = await fetch(base + '/quizzes/student/results', { headers: authHeaders });
      const resultsText = await resultsRes.text();
      
      console.log('Student results response status:', resultsRes.status);
      console.log('Student results response:', resultsText);
      
      if (resultsRes.ok) {
        try {
          const resultsJson = JSON.parse(resultsText);
          console.log('Parsed results structure:');
          console.log('- Results array length:', resultsJson.results?.length || 0);
          if (resultsJson.results && resultsJson.results.length > 0) {
            console.log('- First result sample:', JSON.stringify(resultsJson.results[0], null, 2));
          }
        } catch (parseError) {
          console.log('Failed to parse JSON:', parseError.message);
        }
      }
      return;
    }
    
    const loginBody = await loginRes.json();
    console.log('Login successful:', loginBody);
    
    if (!loginBody.token) {
      console.log('No token in response');
      return;
    }
    
    const authHeaders = { Authorization: `Bearer ${loginBody.token}` };
    const resultsRes = await fetch(base + '/quizzes/student/results', { headers: authHeaders });
    const resultsText = await resultsRes.text();
    
    console.log('Student results response status:', resultsRes.status);
    console.log('Student results response:', resultsText);
    
    if (resultsRes.ok) {
      try {
        const resultsJson = JSON.parse(resultsText);
        console.log('Parsed results structure:');
        console.log('- Results array length:', resultsJson.results?.length || 0);
        if (resultsJson.results && resultsJson.results.length > 0) {
          console.log('- First result sample:', JSON.stringify(resultsJson.results[0], null, 2));
        }
      } catch (parseError) {
        console.log('Failed to parse JSON:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
})();