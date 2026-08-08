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

    const custRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Challan Customer', mobile: '1234567890', businessName: 'C', customerType: 'RETAIL', address: '1', status: 'ACTIVE' })
    });
    const customerId = (await custRes.json()).customer.id;

    const prodARes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Prod A', sku: 'SKU-A-' + Date.now(), category: 'Cat', unitPrice: 100, currentStock: 10, minimumStock: 5, warehouseLocation: 'W1' })
    });
    const productIdA = (await prodARes.json()).product.id;

    const prodBRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Prod B', sku: 'SKU-B-' + Date.now(), category: 'Cat', unitPrice: 200, currentStock: 20, minimumStock: 5, warehouseLocation: 'W1' })
    });
    const productIdB = (await prodBRes.json()).product.id;

    const challanRes = await fetch(`${BASE_URL}/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        customerId,
        items: [
          { productId: productIdA, quantity: 5 },
          { productId: productIdB, quantity: 25 } 
        ]
      })
    });
    const challanData = await challanRes.json();
    console.log('Create Draft Challan:', challanData.success ? 'OK' : 'FAILED');
    const challanId = challanData.challan.id;

    const badConfirmRes = await fetch(`${BASE_URL}/challans/${challanId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const badConfirmData = await badConfirmRes.json();
    console.log('Confirm Insufficient Stock (Expect 400):', badConfirmRes.status === 400 && badConfirmData.message === 'Insufficient stock' ? 'OK' : 'FAILED');

    let aRes = await fetch(`${BASE_URL}/products/${productIdA}`, { headers: { 'Authorization': `Bearer ${adminToken}` }});
    console.log('Prod A Stock (Expected 10):', (await aRes.json()).product.currentStock === 10 ? 'OK' : 'FAILED');

    const goodChallanRes = await fetch(`${BASE_URL}/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        customerId,
        items: [
          { productId: productIdA, quantity: 5 },
          { productId: productIdB, quantity: 5 }
        ]
      })
    });
    const goodChallanId = (await goodChallanRes.json()).challan.id;

    const confirmRes = await fetch(`${BASE_URL}/challans/${goodChallanId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Confirm Valid Challan:', (await confirmRes.json()).success ? 'OK' : 'FAILED');

    aRes = await fetch(`${BASE_URL}/products/${productIdA}`, { headers: { 'Authorization': `Bearer ${adminToken}` }});
    console.log('Prod A Stock (Expected 5):', (await aRes.json()).product.currentStock === 5 ? 'OK' : 'FAILED');

    const doubleConfirmRes = await fetch(`${BASE_URL}/challans/${goodChallanId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Double Confirm (Expect 400):', doubleConfirmRes.status === 400 ? 'OK' : 'FAILED');

    const cancelRes = await fetch(`${BASE_URL}/challans/${challanId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Cancel Draft Challan:', (await cancelRes.json()).success ? 'OK' : 'FAILED');

    await fetch(`${BASE_URL}/products/${productIdA}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Changed Name A' })
    });
    const getChallanRes = await fetch(`${BASE_URL}/challans/${goodChallanId}`, { headers: { 'Authorization': `Bearer ${adminToken}` }});
    const fetchedChallan = await getChallanRes.json();
    console.log('Snapshot preserved (Expect Prod A):', fetchedChallan.challan.items.some((i: any) => i.productNameSnapshot === 'Prod A') ? 'OK' : 'FAILED');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

test();
