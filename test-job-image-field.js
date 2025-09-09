// Test script để kiểm tra job image field
const testJobImageField = async () => {
  console.log('🧪 Testing Job Image Field...\n');
  
  // Step 1: Login as admin
  console.log('1️⃣ Logging in as admin...');
  let adminToken = '';
  
  try {
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
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
      console.log('✅ Admin login successful');
    } else {
      console.log('❌ Admin login failed');
      return;
    }
  } catch (error) {
    console.error('💥 Login error:', error.message);
    return;
  }
  
  // Step 2: Create job with image
  console.log('\n2️⃣ Creating job with image...');
  try {
    const response = await fetch('http://localhost:3000/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Test Job With Image Field',
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
    
    console.log('📊 Create job response status:', response.status);
    const data = await response.json();
    console.log('📊 Create job response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Job created successfully');
      console.log('💡 Image field value:', data.data?.img);
    } else {
      console.log('❌ Job creation failed:', data.message);
    }
  } catch (error) {
    console.error('💥 Create job error:', error.message);
  }
  
  // Step 3: Get jobs list to see image field
  console.log('\n3️⃣ Getting jobs list...');
  try {
    const response = await fetch('http://localhost:3000/api/jobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Get jobs response status:', response.status);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Jobs retrieved successfully');
      console.log('📊 Number of jobs:', data.length || data.data?.length || 0);
      
      // Show image field for first few jobs
      const jobs = data.data || data || [];
      jobs.slice(0, 3).forEach((job, index) => {
        console.log(`📊 Job ${index + 1}:`);
        console.log(`   Title: ${job.title}`);
        console.log(`   Image field: ${job.img}`);
        console.log(`   Image type: ${typeof job.img}`);
      });
    } else {
      console.log('❌ Get jobs failed:', data.message);
    }
  } catch (error) {
    console.error('💥 Get jobs error:', error.message);
  }
  
  console.log('\n🏁 Job image field testing completed!');
  console.log('\n💡 Expected behavior:');
  console.log('1. Job creation should accept img field');
  console.log('2. Backend should return img field value');
  console.log('3. Frontend should display image correctly');
};

// Run tests
console.log('🚀 Starting Job Image Field Tests...\n');
testJobImageField();


