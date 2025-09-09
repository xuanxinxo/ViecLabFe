// Test script để kiểm tra job hiện có và image field
const testExistingJobImage = async () => {
  console.log('🧪 Testing Existing Job Image Field...\n');
  
  // Step 1: Get jobs list from Next.js API
  console.log('1️⃣ Getting jobs list from Next.js API...');
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
      
      // Show image field for all jobs
      const jobs = data.data || data || [];
      console.log('\n📊 All jobs image field analysis:');
      jobs.forEach((job, index) => {
        console.log(`Job ${index + 1}:`);
        console.log(`   Title: ${job.title}`);
        console.log(`   Image field: ${job.img}`);
        console.log(`   Image type: ${typeof job.img}`);
        console.log(`   Has image: ${job.img ? 'Yes' : 'No'}`);
        console.log('   ---');
      });
      
      // Count jobs with/without images
      const jobsWithImages = jobs.filter(job => job.img && job.img !== null);
      const jobsWithoutImages = jobs.filter(job => !job.img || job.img === null);
      
      console.log(`\n📊 Summary:`);
      console.log(`   Jobs with images: ${jobsWithImages.length}`);
      console.log(`   Jobs without images: ${jobsWithoutImages.length}`);
      console.log(`   Total jobs: ${jobs.length}`);
      
    } else {
      console.log('❌ Get jobs failed:', data.message);
    }
  } catch (error) {
    console.error('💥 Get jobs error:', error.message);
  }
  
  console.log('\n🏁 Existing job image testing completed!');
  console.log('\n💡 Next steps:');
  console.log('1. If all jobs have img: null, backend doesn\'t support img field');
  console.log('2. Frontend needs to handle null img values gracefully');
  console.log('3. Consider using placeholder images for jobs without images');
};

// Run tests
console.log('🚀 Starting Existing Job Image Tests...\n');
testExistingJobImage();

