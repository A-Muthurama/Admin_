const testData = {
    name: "API Test Plan",
    price: 150,
    posts: 12,
    months: 2
};

console.log('🧪 Testing POST /plans endpoint...\n');
console.log('📤 Sending data:', testData);

fetch('http://localhost:4000/plans', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
    .then(response => response.json())
    .then(data => {
        console.log('\n📥 Response:', data);
        if (data.success) {
            console.log('✅ Plan created successfully!');
            console.log('📋 Created plan:', data.data);
        } else {
            console.log('❌ Failed to create plan:', data.message || data.error);
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
