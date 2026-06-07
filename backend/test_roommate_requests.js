// test_roommate_requests.js
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

const makeRequest = (url, method, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING ROOMMATE REQUESTS INTEGRATION TESTS ---');
  
  // Waking up Neon database
  console.log('Waking up Neon database...');
  try {
    await makeRequest(`${API_BASE}/db-status`, 'GET');
    console.log('Database connected.\n');
  } catch (err) {
    console.log('Database wakeup check skipped...\n');
  }

  const randomSuffix = Math.floor(Math.random() * 1000000);
  const userAEmail = `usera_${randomSuffix}@example.com`;
  const userBEmail = `userb_${randomSuffix}@example.com`;
  
  let userAToken = null;
  let userBToken = null;
  let requestId = null;

  // 1. Setup: Register User A & User B
  console.log('Setup: Registering two test users...');
  try {
    const userAReg = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
      name: 'User Alpha',
      email: userAEmail,
      password: 'password123',
      role: 'tenant'
    });
    userAToken = userAReg.data.token;
    console.log(`Registered User A: ${userAEmail}`);

    const userBReg = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
      name: 'User Beta',
      email: userBEmail,
      password: 'password123',
      role: 'tenant'
    });
    userBToken = userBReg.data.token;
    console.log(`Registered User B: ${userBEmail}\n`);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }

  // Test 1: POST /roommate-requests without token (expecting 401)
  console.log('Test 1: POST /roommate-requests without token (expecting 401)');
  const dummyRequest = {
    title: 'Looking for flatmate in Viman Nagar',
    description: 'Looking for a chill flatmate. Non-smoker, veg preferred.',
    budget: 5500,
    preferred_location: 'Viman Nagar, Pune',
    sharing_type: 'double'
  };
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests`, 'POST', dummyRequest);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 401 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 2: POST /roommate-requests with token User A (expecting 201)
  console.log('Test 2: POST /roommate-requests with User A token (expecting 201)');
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests`, 'POST', dummyRequest, userAToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Creator Name joined: ${res.data?.roommateRequest?.user_name}`);
    if (res.statusCode === 201 && res.data?.roommateRequest?.id) {
      requestId = res.data.roommateRequest.id;
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
    }
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 3: GET /roommate-requests (Public - check list & pagination)
  console.log('Test 3: GET /roommate-requests (expecting 200 with pagination)');
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests?page=1&limit=5`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Pagination: ${JSON.stringify(res.data?.pagination)}`);
    console.log(`Requests count: ${res.data?.roommateRequests?.length}`);
    console.log(res.statusCode === 200 && res.data?.pagination?.totalCount >= 1 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 4: GET /roommate-requests filters (Public - city filter matching location string)
  console.log('Test 4: GET /roommate-requests with filter ?city=Pune&minBudget=5000&maxBudget=6000 (expecting 200)');
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests?city=Pune&minBudget=5000&maxBudget=6000`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Matches count: ${res.data?.roommateRequests?.length}`);
    const matches = res.data?.roommateRequests?.every(
      r => r.preferred_location.toLowerCase().includes('pune') && r.budget >= 5000 && r.budget <= 6000
    );
    console.log(res.statusCode === 200 && matches ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 5: GET /roommate-requests/:id (Public - return single details)
  console.log(`Test 5: GET /roommate-requests/${requestId} (expecting 200)`);
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests/${requestId}`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Request Title: ${res.data?.roommateRequest?.title}`);
    console.log(res.statusCode === 200 && res.data?.roommateRequest?.id === requestId ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 6: PUT /roommate-requests/:id by User B (Restricted - should get 403)
  console.log(`Test 6: PUT /roommate-requests/${requestId} by User B (expecting 403)`);
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests/${requestId}`, 'PUT', { title: 'Hacked Title' }, userBToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 7: PUT /roommate-requests/:id by User A (Authorized - expect 200)
  console.log(`Test 7: PUT /roommate-requests/${requestId} by User A/Creator (expecting 200)`);
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests/${requestId}`, 'PUT', {
      title: 'Looking for female flatmate in Viman Nagar, Pune (Premium)',
      budget: 6000
    }, userAToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Updated Title: ${res.data?.roommateRequest?.title}`);
    console.log(`Updated Budget: ${res.data?.roommateRequest?.budget}`);
    console.log(res.statusCode === 200 && res.data?.roommateRequest?.budget === 6000 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 8: DELETE /roommate-requests/:id by User B (Restricted - should get 403)
  console.log(`Test 8: DELETE /roommate-requests/${requestId} by User B (expecting 403)`);
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests/${requestId}`, 'DELETE', null, userBToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 9: DELETE /roommate-requests/:id by User A (Authorized - expect 200)
  console.log(`Test 9: DELETE /roommate-requests/${requestId} by User A/Creator (expecting 200)`);
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests/${requestId}`, 'DELETE', null, userAToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 200 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 10: GET /roommate-requests/:id after deletion (expecting 404)
  console.log(`Test 10: GET /roommate-requests/${requestId} after delete (expecting 404)`);
  try {
    const res = await makeRequest(`${API_BASE}/roommate-requests/${requestId}`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 404 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');
};

setTimeout(runTests, 3000);
