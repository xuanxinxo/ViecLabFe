// Test script để kiểm tra backend trực tiếp
const testBackendDirect = async () => {
  console.log('🧪 Testing Backend Direct API...\n');
  
  // Step 1: Login as admin directly to backend
  console.log('1️⃣ Logging in as admin to backend...');
  let adminToken = '';
  
  try {
    const loginResponse = await fetch('https://vieclabbe.onrender.com/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      }),
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      adminToken = loginData.data?.accessToken;
      console.log('✅ Backend admin login successful');
      console.log('🔑 Admin token:', adminToken ? 'Received' : 'Not received');
    } else {
      console.log('❌ Backend admin login failed');
      return;
    }
  } catch (error) {
    console.error('💥 Backend login error:', error.message);
    return;
  }
  
  // Step 2: Create job with image field directly to backend
  console.log('\n2️⃣ Creating job with image field directly to backend...');
  try {
    const response = await fetch('https://vieclabbe.onrender.com/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Backend Direct Test Job',
        company: 'Test Company',
        location: 'Test Location',
        type: 'Full-time',
        salary: '1000-2000',
        description: 'Test job description',
        requirements: ['Test requirement'],
        benefits: ['Test benefit'],
        deadline: '2024-12-31',
        img: 'uploaded_image'
      }),
    });
    
    console.log('📊 Backend direct response status:', response.status);
    const data = await response.json();
    console.log('📊 Backend direct response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Backend job created successfully');
      console.log('💡 Image field value from backend:', data.data?.img);
      console.log('💡 Image field type:', typeof data.data?.img);
    } else {
      console.log('❌ Backend job creation failed:', data.message);
    }
  } catch (error) {
    console.error('💥 Backend create job error:', error.message);
  }
  
  // Step 3: Get jobs list from backend to see image field
  console.log('\n3️⃣ Getting jobs list from backend...');
  try {
    const response = await fetch('https://vieclabbe.onrender.com/api/jobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Backend get jobs response status:', response.status);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend jobs retrieved successfully');
      console.log('📊 Number of jobs from backend:', data.length || data.data?.length || 0);
      
      // Show image field for first few jobs
      const jobs = data.data || data || [];
      jobs.slice(0, 3).forEach((job, index) => {
        console.log(`📊 Backend Job ${index + 1}:`);
        console.log(`   Title: ${job.title}`);
        console.log(`   Image field: ${job.img}`);
        console.log(`   Image type: ${typeof job.img}`);
      });
    } else {
      console.log('❌ Backend get jobs failed:', data.message);
    }
  } catch (error) {
    console.error('💥 Backend get jobs error:', error.message);
  }
  
  console.log('\n🏁 Backend direct testing completed!');
  console.log('\n💡 Analysis:');
  console.log('1. If backend returns img: null, the backend doesn\'t support img field');
  console.log('2. If backend returns img: "uploaded_image", the backend supports it');
  console.log('3. Frontend needs to handle null img values gracefully');
};

// Run tests
console.log('🚀 Starting Backend Direct Tests...\n');
testBackendDirect();

