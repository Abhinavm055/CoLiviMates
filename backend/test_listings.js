// test_listings.js
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
  console.log('--- STARTING LISTINGS CRUD INTEGRATION TESTS ---');
  
  // Waking up Neon database
  console.log('Waking up Neon database...');
  try {
    await makeRequest(`${API_BASE}/db-status`, 'GET');
    console.log('Database connected.\n');
  } catch (err) {
    console.log('Database wakeup check skipped...\n');
  }

  const randomSuffix = Math.floor(Math.random() * 1000000);
  const ownerEmail = `owner_${randomSuffix}@example.com`;
  const tenantEmail = `tenant_${randomSuffix}@example.com`;
  
  let ownerToken = null;
  let tenantToken = null;
  let listingId = null;

  // 1. Setup: Register Owner & Tenant
  console.log('Setup: Registering Owner and Tenant...');
  try {
    const ownerReg = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
      name: 'Listing Owner',
      email: ownerEmail,
      password: 'password123',
      role: 'owner'
    });
    ownerToken = ownerReg.data.token;
    console.log(`Registered Owner: ${ownerEmail}`);

    const tenantReg = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
      name: 'Listing Tenant',
      email: tenantEmail,
      password: 'password123',
      role: 'tenant'
    });
    tenantToken = tenantReg.data.token;
    console.log(`Registered Tenant: ${tenantEmail}\n`);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }

  // Test 1: POST /listings (Restricted - Tenant should get 403)
  console.log('Test 1: POST /listings by Tenant (expecting 403)');
  const dummyListing = {
    title: 'Test PG Near Hebbal',
    description: 'Perfect budget room for student or worker.',
    rent: 6000,
    location: 'Hebbal',
    city: 'Bengaluru',
    sharing_type: 'double',
    facilities: ['WiFi', 'AC', 'Power Backup'],
    images: [],
    available_from: '2026-07-01'
  };
  try {
    const res = await makeRequest(`${API_BASE}/listings`, 'POST', dummyListing, tenantToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 2: POST /listings (Authorized - Owner should get 201)
  console.log('Test 2: POST /listings by Owner (expecting 201)');
  try {
    const res = await makeRequest(`${API_BASE}/listings`, 'POST', dummyListing, ownerToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Listing Owner Name joined: ${res.data?.listing?.owner_name}`);
    if (res.statusCode === 201 && res.data?.listing?.id) {
      listingId = res.data.listing.id;
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
    }
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 3: GET /listings (Public - List all with pagination)
  console.log('Test 3: GET /listings (expecting 200 with pagination metadata)');
  try {
    const res = await makeRequest(`${API_BASE}/listings?page=1&limit=5`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Pagination: ${JSON.stringify(res.data?.pagination)}`);
    console.log(`Listings count in page: ${res.data?.listings?.length}`);
    console.log(res.statusCode === 200 && res.data?.pagination?.totalCount >= 1 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 4: GET /listings with filters (Public - city and rent filter)
  console.log('Test 4: GET /listings with filter ?city=Bengaluru&minRent=5000&maxRent=7000 (expecting 200)');
  try {
    const res = await makeRequest(`${API_BASE}/listings?city=Bengaluru&minRent=5000&maxRent=7000`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Listings count found: ${res.data?.listings?.length}`);
    const matches = res.data?.listings?.every(l => l.city === 'Bengaluru' && l.rent >= 5000 && l.rent <= 7000);
    console.log(res.statusCode === 200 && matches ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 5: GET /listings/:id (Public - return single listing detail)
  console.log(`Test 5: GET /listings/${listingId} (expecting 200)`);
  try {
    const res = await makeRequest(`${API_BASE}/listings/${listingId}`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Listing Title: ${res.data?.listing?.title}`);
    console.log(res.statusCode === 200 && res.data?.listing?.id === listingId ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 6: PUT /listings/:id (Restricted - tenant trying to update owner\'s listing should get 403)
  console.log(`Test 6: PUT /listings/${listingId} by Tenant (expecting 403)`);
  try {
    const res = await makeRequest(`${API_BASE}/listings/${listingId}`, 'PUT', { title: 'Hacked Title' }, tenantToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 7: PUT /listings/:id (Authorized - owner updating own listing should get 200)
  console.log(`Test 7: PUT /listings/${listingId} by Owner (expecting 200)`);
  try {
    const res = await makeRequest(`${API_BASE}/listings/${listingId}`, 'PUT', {
      title: 'Premium PG Near Hebbal Junction',
      rent: 6500
    }, ownerToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Updated Title: ${res.data?.listing?.title}`);
    console.log(`Updated Rent: ${res.data?.listing?.rent}`);
    console.log(res.statusCode === 200 && res.data?.listing?.rent === 6500 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 8: DELETE /listings/:id (Restricted - tenant deleting owner\'s listing should get 403)
  console.log(`Test 8: DELETE /listings/${listingId} by Tenant (expecting 403)`);
  try {
    const res = await makeRequest(`${API_BASE}/listings/${listingId}`, 'DELETE', null, tenantToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 9: DELETE /listings/:id (Authorized - owner deleting own listing should get 200)
  console.log(`Test 9: DELETE /listings/${listingId} by Owner (expecting 200)`);
  try {
    const res = await makeRequest(`${API_BASE}/listings/${listingId}`, 'DELETE', null, ownerToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 200 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 10: GET /listings/:id after deletion (expecting 404)
  console.log(`Test 10: GET /listings/${listingId} after delete (expecting 404)`);
  try {
    const res = await makeRequest(`${API_BASE}/listings/${listingId}`, 'GET');
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 404 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');
};

setTimeout(runTests, 3000);
