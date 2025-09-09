// Test script for Real Data from Backend
const BASE_URL = 'http://localhost:3000';

// Test credentials
const testCredentials = {
  username: 'admin',
  password: 'password'
};

let authToken = '';

// Helper function to make requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    return { response, data, success: response.ok };
  } catch (error) {
    return { error: error.message, success: false };
  }
}

// Test 1: Admin Login
async function testLogin() {
  console.log('🔐 Testing Admin Login...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    body: JSON.stringify(testCredentials),
  });
  
  if (result.success && result.data.success) {
    authToken = result.data.data.accessToken;
    console.log('✅ Login successful!');
    console.log('   User:', result.data.data.user);
    return true;
  } else {
    console.log('❌ Login failed:', result.data?.message || result.error);
    return false;
  }
}

// Test 2: Jobs API with Real Data
async function testJobsAPI() {
  console.log('💼 Testing Jobs API with Real Data...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/jobs`, {
    method: 'GET',
    headers: {
      'Cookie': `adminToken=${authToken}`
    }
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Jobs API working with real data!');
    console.log('   Jobs count:', result.data.data?.length || 0);
    if (result.data.data && result.data.data.length > 0) {
      console.log('   Sample job:', {
        title: result.data.data[0].title,
        company: result.data.data[0].company,
        location: result.data.data[0].location
      });
    }
    return true;
  } else {
    console.log('❌ Jobs API failed:', result.data?.message || result.error);
    return false;
  }
}

// Test 3: Applications API with Real Data
async function testApplicationsAPI() {
  console.log('📝 Testing Applications API with Real Data...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/applications`, {
    method: 'GET',
    headers: {
      'Cookie': `adminToken=${authToken}`
    }
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Applications API working with real data!');
    console.log('   Applications count:', result.data.data?.length || 0);
    if (result.data.data && result.data.data.length > 0) {
      console.log('   Sample application:', {
        name: result.data.data[0].name || result.data.data[0].applicantName,
        email: result.data.data[0].email,
        jobTitle: result.data.data[0].jobTitle
      });
    }
    return true;
  } else {
    console.log('❌ Applications API failed:', result.data?.message || result.error);
    return false;
  }
}

// Test 4: News API with Real Data
async function testNewsAPI() {
  console.log('📰 Testing News API with Real Data...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/news`, {
    method: 'GET',
    headers: {
      'Cookie': `adminToken=${authToken}`
    }
  });
  
  if (result.success && result.data.success) {
    console.log('✅ News API working with real data!');
    console.log('   News count:', result.data.data?.length || 0);
    if (result.data.data && result.data.data.length > 0) {
      console.log('   Sample news:', {
        title: result.data.data[0].title,
        summary: result.data.data[0].summary?.substring(0, 50) + '...'
      });
    }
    return true;
  } else {
    console.log('❌ News API failed:', result.data?.message || result.error);
    return false;
  }
}

// Test 5: Hirings API with Real Data
async function testHiringsAPI() {
  console.log('🎯 Testing Hirings API with Real Data...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/hirings`, {
    method: 'GET',
    headers: {
      'Cookie': `adminToken=${authToken}`
    }
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Hirings API working with real data!');
    console.log('   Hirings count:', result.data.data?.length || 0);
    if (result.data.data && result.data.data.length > 0) {
      console.log('   Sample hiring:', {
        title: result.data.data[0].title,
        company: result.data.data[0].company,
        location: result.data.data[0].location
      });
    }
    return true;
  } else {
    console.log('❌ Hirings API failed:', result.data?.message || result.error);
    return false;
  }
}

// Test 6: Dashboard API with Real Data
async function testDashboardAPI() {
  console.log('📊 Testing Dashboard API with Real Data...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/dashboard`, {
    method: 'GET',
    headers: {
      'Cookie': `adminToken=${authToken}`
    }
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Dashboard API working with real data!');
    console.log('   Dashboard stats:', result.data.data);
    return true;
  } else {
    console.log('❌ Dashboard API failed:', result.data?.message || result.error);
    return false;
  }
}

// Main test function
async function runRealDataTests() {
  console.log('🚀 Starting Real Data Tests...\n');
  
  const results = {
    login: false,
    jobs: false,
    applications: false,
    news: false,
    hirings: false,
    dashboard: false
  };
  
  // Test login first
  results.login = await testLogin();
  console.log('');
  
  if (!results.login) {
    console.log('❌ Cannot proceed without authentication!');
    return;
  }
  
  // Test all APIs with real data
  results.jobs = await testJobsAPI();
  console.log('');
  
  results.applications = await testApplicationsAPI();
  console.log('');
  
  results.news = await testNewsAPI();
  console.log('');
  
  results.hirings = await testHiringsAPI();
  console.log('');
  
  results.dashboard = await testDashboardAPI();
  console.log('');
  
  // Summary
  console.log('📋 REAL DATA TEST SUMMARY:');
  console.log('==========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All APIs are working with real data from backend!');
  } else {
    console.log('⚠️  Some APIs failed. Check backend connection.');
  }
}

// Run tests
runRealDataTests().catch(console.error);


