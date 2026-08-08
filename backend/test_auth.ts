import 'dotenv/config';

async function test() {
  try {
    console.log('Testing login...');
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);

    if (loginData.token) {
      console.log('\nTesting /me...');
      const meRes = await fetch('http://localhost:4000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      console.log('Me Response:', await meRes.json());

      console.log('\nTesting role auth (Admin user accessing Admin route)...');
      const adminRes = await fetch('http://localhost:4000/api/auth/admin-only', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      console.log('Admin Route Response:', await adminRes.json(), 'Status:', adminRes.status);
      
      console.log('\nTesting role auth (Sales user accessing Admin route)...');
      const salesLogin = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'sales@example.com', password: 'password123' })
      });
      const salesData = await salesLogin.json();
      
      const salesAdminRes = await fetch('http://localhost:4000/api/auth/admin-only', {
        headers: { 'Authorization': `Bearer ${salesData.token}` }
      });
      console.log('Sales on Admin Route Response:', await salesAdminRes.json(), 'Status:', salesAdminRes.status);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

test();
