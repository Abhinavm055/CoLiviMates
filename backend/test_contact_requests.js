// test_contact_requests.js
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
  console.log('--- STARTING CONTACT REQUEST INTEGRATION TESTS ---');
  
  // Database wakeup check
  try {
    await makeRequest(`${API_BASE}/db-status`, 'GET');
    console.log('Database connected.\n');
  } catch (err) {
    console.log('Database check skipped...\n');
  }

  const randomSuffix = Math.floor(Math.random() * 1000000);
  const ownerEmail = `owner_cr_${randomSuffix}@example.com`;
  const tenantEmail = `tenant_cr_${randomSuffix}@example.com`;
  
  let ownerToken = null;
  let tenantToken = null;
  let listingId = null;
  let requestId = null;

  // 1. Setup: Register Owner & Tenant
  console.log('Setup: Registering Owner and Tenant...');
  try {
    const ownerReg = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
      name: 'Owner Tester',
      email: ownerEmail,
      password: 'password123',
      role: 'owner'
    });
    ownerToken = ownerReg.data.token;
    console.log(`Registered Owner: ${ownerEmail}`);

    const tenantReg = await makeRequest(`${API_BASE}/auth/register`, 'POST', {
      name: 'Tenant Tester',
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

  // 2. Setup: Owner creates a listing
  console.log('Setup: Owner creating a listing...');
  const testListing = {
    title: ' hebrews 11 room ',
    description: 'A cozy testing listing.',
    rent: 5500,
    location: 'Central Town',
    city: 'Bengaluru',
    sharing_type: 'single',
    facilities: ['WiFi'],
    images: [],
    available_from: '2026-06-10'
  };
  try {
    const res = await makeRequest(`${API_BASE}/listings`, 'POST', testListing, ownerToken);
    listingId = res.data.listing.id;
    console.log(`Created Listing ID: ${listingId}\n`);
  } catch (err) {
    console.error('Listing creation failed:', err.message);
    process.exit(1);
  }

  // Test 1: POST /contact-requests by Owner (self-inquiry - expecting 400)
  console.log('Test 1: POST /contact-requests (Self-Inquiry - Owner contacting own listing, expecting 400)');
  try {
    const res = await makeRequest(`${API_BASE}/contact-requests`, 'POST', {
      listingId: listingId,
      message: 'Self inquiry message.'
    }, ownerToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response message: ${res.data?.error}`);
    console.log(res.statusCode === 400 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 2: POST /contact-requests by Tenant (expecting 201)
  console.log('Test 2: POST /contact-requests by Tenant (expecting 201 using camelCase listingId)');
  try {
    const res = await makeRequest(`${API_BASE}/contact-requests`, 'POST', {
      listingId: listingId,
      message: 'Hi, I am interested in renting this room!'
    }, tenantToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${JSON.stringify(res.data?.contactRequest)}`);
    if (res.statusCode === 201 && res.data?.contactRequest?.id) {
      requestId = res.data.contactRequest.id;
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
    }
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 3: GET /contact-requests/owner by Tenant (restricted - expecting 403)
  console.log('Test 3: GET /contact-requests/owner by Tenant (expecting 403)');
  try {
    const res = await makeRequest(`${API_BASE}/contact-requests/owner`, 'GET', null, tenantToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 4: GET /contact-requests/owner by Owner (expecting 200 with joins)
  console.log('Test 4: GET /contact-requests/owner by Owner (expecting 200 with tenant & listing details)');
  try {
    const res = await makeRequest(`${API_BASE}/contact-requests/owner`, 'GET', null, ownerToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Requests retrieved count: ${res.data?.contactRequests?.length}`);
    const reqItem = res.data?.contactRequests?.find(r => r.id === requestId);
    if (res.statusCode === 200 && reqItem) {
      console.log(`Tenant Name: ${reqItem.tenant_name}`);
      console.log(`Tenant Email: ${reqItem.tenant_email}`);
      console.log(`Listing Name: ${reqItem.listing_title}`);
      console.log(`Message: ${reqItem.message}`);
      console.log(`Date: ${reqItem.created_at}`);
      
      const checkDetails = reqItem.tenant_name === 'Tenant Tester' &&
                           reqItem.tenant_email === tenantEmail &&
                           reqItem.listing_title === testListing.title &&
                           reqItem.status === 'pending';
      console.log(checkDetails ? '✅ PASS' : '❌ FAIL (Mismatch in returned fields)');
    } else {
      console.log('❌ FAIL (Request not found in owner listings)');
    }
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 5: GET /contact-requests/tenant by Tenant (expecting 200 with owner & listing details)
  console.log('Test 5: GET /contact-requests/tenant by Tenant (expecting 200 with owner & listing details)');
  try {
    const res = await makeRequest(`${API_BASE}/contact-requests/tenant`, 'GET', null, tenantToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Requests retrieved count: ${res.data?.contactRequests?.length}`);
    const reqItem = res.data?.contactRequests?.find(r => r.id === requestId);
    if (res.statusCode === 200 && reqItem) {
      console.log(`Owner Name: ${reqItem.owner_name}`);
      console.log(`Owner Email: ${reqItem.owner_email}`);
      console.log(`Listing Name: ${reqItem.listing_title}`);
      
      const checkDetails = reqItem.owner_name === 'Owner Tester' &&
                           reqItem.owner_email === ownerEmail &&
                           reqItem.listing_title === testListing.title &&
                           reqItem.status === 'pending';
      console.log(checkDetails ? '✅ PASS' : '❌ FAIL (Mismatch in returned fields)');
    } else {
      console.log('❌ FAIL (Request not found in tenant inquiries)');
    }
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 6: PUT /contact-requests/:id/status by Tenant (expecting 403)
  console.log(`Test 6: PUT /contact-requests/${requestId}/status by Tenant (expecting 403)`);
  try {
    const res = await makeRequest(`${API_BASE}/contact-requests/${requestId}/status`, 'PUT', { status: 'accepted' }, tenantToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(res.statusCode === 403 ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 7: PUT /contact-requests/:id/status by Owner (expecting 200 with accepted status)
  console.log(`Test 7: PUT /contact-requests/${requestId}/status by Owner (expecting 200 with accepted status)`);
  try {
    const res = await makeRequest(`${API_BASE}/contact-requests/${requestId}/status`, 'PUT', { status: 'accepted' }, ownerToken);
    console.log(`Status: ${res.statusCode}`);
    console.log(`New Status: ${res.data?.contactRequest?.status}`);
    console.log(res.statusCode === 200 && res.data?.contactRequest?.status === 'accepted' ? '✅ PASS' : '❌ FAIL');
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
  console.log('--------------------------------------------\n');

  // Test 8: Cleanup - Delete listing (expecting cascade delete of requests)
  console.log(`Cleanup: Owner deleting listing ${listingId}`);
  try {
    await makeRequest(`${API_BASE}/listings/${listingId}`, 'DELETE', null, ownerToken);
    console.log('Listing deleted.');
    
    // Verify request is gone
    const res = await makeRequest(`${API_BASE}/contact-requests/owner`, 'GET', null, ownerToken);
    const hasRequest = res.data?.contactRequests?.some(r => r.id === requestId);
    console.log(!hasRequest ? '✅ Cascaded delete verified successfully.' : '❌ FAIL (Contact request still exists)');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
  console.log('--------------------------------------------\n');
};

setTimeout(runTests, 3000);
