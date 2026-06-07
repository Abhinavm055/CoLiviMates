// scratch/test_auth.js
const http = require('http');

const API_BASE = 'http://localhost:5000/api/auth';

const makeRequest = (url, method, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
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
  const randomEmail = `testuser_${Math.floor(Math.random() * 1000000)}@example.com`;
  console.log('--- STARTING AUTHENTICATION INTEGRATION TESTS ---');
  console.log(`Using email: ${randomEmail}\n`);

  console.log('Waking up Neon database (waiting for cold start)...');
  try {
    const wakeupRes = await makeRequest('http://localhost:5000/api/db-status', 'GET');
    console.log(`Database status: ${wakeupRes.data?.database}, latency: ${wakeupRes.data?.latency}\n`);
  } catch (err) {
    console.log('Database wakeup check failed, proceeding anyway...\n');
  }


  // Test 1: Fetch profile without authentication token
  console.log('Test 1: GET /me without token (expecting 401)');
  try {
    const res = await makeRequest(`${API_BASE}/me`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${JSON.stringify(res.data)}`);
    console.log(res.statusCode === 401 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL (request error):', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 2: Register user
  console.log('Test 2: POST /register (expecting 201)');
  let token = null;
  const regData = {
    name: 'Authentication Tester',
    email: randomEmail,
    password: 'password123',
    role: 'owner'
  };
  try {
    const res = await makeRequest(`${API_BASE}/register`, 'POST', regData);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response User Name: ${res.data?.user?.name}, Role: ${res.data?.user?.role}`);
    console.log(`Token received: ${res.data?.token ? 'Yes (starts with ' + res.data.token.substring(0, 15) + '...)' : 'No'}`);
    if (res.statusCode === 201 && res.data?.token) {
      token = res.data.token;
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
    }
  } catch (err) {
    console.error('❌ FAIL (request error):', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 3: Register same email again (duplicate validation)
  console.log('Test 3: POST /register duplicate email (expecting 400)');
  try {
    const res = await makeRequest(`${API_BASE}/register`, 'POST', regData);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${JSON.stringify(res.data)}`);
    console.log(res.statusCode === 400 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL (request error):', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 4: Login user
  console.log('Test 4: POST /login (expecting 200)');
  const loginData = {
    email: randomEmail,
    password: 'password123'
  };
  try {
    const res = await makeRequest(`${API_BASE}/login`, 'POST', loginData);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response message: ${res.data?.message}`);
    console.log(`Token received: ${res.data?.token ? 'Yes' : 'No'}`);
    if (res.statusCode === 200 && res.data?.token) {
      token = res.data.token; // Update token just in case
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
    }
  } catch (err) {
    console.error('❌ FAIL (request error):', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 5: Fetch profile with valid token
  console.log('Test 5: GET /me with token (expecting 200)');
  try {
    const res = await makeRequest(`${API_BASE}/me`, 'GET', null, token);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response Profile: ${JSON.stringify(res.data?.user)}`);
    console.log(res.statusCode === 200 && res.data?.user?.email === randomEmail ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL (request error):', err.message);
  }
  console.log('--------------------------------------------\n');
};

// Wait a bit to ensure server is listening
setTimeout(runTests, 3000);
