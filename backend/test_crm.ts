import 'dotenv/config';

const BASE_URL = 'http://localhost:4000/api';

async function test() {
  try {
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
    });
    const adminToken = (await adminLogin.json()).token;

    const salesLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sales@example.com', password: 'password123' })
    });
    const salesToken = (await salesLogin.json()).token;

    const newCustomerRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${salesToken}` },
      body: JSON.stringify({
        name: 'Test Customer',
        mobile: '1234567890',
        businessName: 'Test Business',
        customerType: 'RETAIL',
        address: '123 Test St',
        status: 'LEAD'
      })
    });
    const customerData = await newCustomerRes.json();
    console.log('Create Customer (Sales):', customerData.success ? 'OK' : customerData);
    const customerId = customerData.customer.id;

    const invalidCustomerRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${salesToken}` },
      body: JSON.stringify({ name: '' }) 
    });
    console.log('Invalid Create Customer:', (await invalidCustomerRes.json()).message === 'Invalid input' ? 'OK' : 'FAILED');

    const searchRes = await fetch(`${BASE_URL}/customers?search=Test&status=LEAD`, {
      headers: { 'Authorization': `Bearer ${salesToken}` }
    });
    const searchData = await searchRes.json();
    console.log('Search Customers:', searchData.customers.length > 0 ? 'OK' : 'FAILED');

    const updateRes = await fetch(`${BASE_URL}/customers/${customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${salesToken}` },
      body: JSON.stringify({ status: 'ACTIVE' })
    });
    console.log('Update Customer:', (await updateRes.json()).customer.status === 'ACTIVE' ? 'OK' : 'FAILED');

    const addFollowUpRes = await fetch(`${BASE_URL}/customers/${customerId}/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${salesToken}` },
      body: JSON.stringify({ note: 'Called customer', followUpDate: '2026-08-10T12:00:00Z' })
    });
    console.log('Add Follow Up:', (await addFollowUpRes.json()).success ? 'OK' : 'FAILED');

    const getDetailsRes = await fetch(`${BASE_URL}/customers/${customerId}`, {
      headers: { 'Authorization': `Bearer ${salesToken}` }
    });
    const detailsData = await getDetailsRes.json();
    console.log('Get Customer Details:', detailsData.customer.followUps.length === 1 ? 'OK' : 'FAILED');

    const salesDeleteRes = await fetch(`${BASE_URL}/customers/${customerId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${salesToken}` }
    });
    console.log('Sales Delete Customer (Expect 403):', salesDeleteRes.status === 403 ? 'OK' : 'FAILED');

    const adminDeleteRes = await fetch(`${BASE_URL}/customers/${customerId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Admin Delete Customer (Expect 200):', adminDeleteRes.status === 200 ? 'OK' : 'FAILED');
    
    const afterDeleteRes = await fetch(`${BASE_URL}/customers/${customerId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Customer after soft delete status:', (await afterDeleteRes.json()).customer.status);

  } catch (error) {
    console.error('Test error:', error);
  }
}

test();
