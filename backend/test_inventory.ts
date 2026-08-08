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

    const productDataPayload = {
      name: 'Test Product ' + Date.now(),
      sku: 'SKU-' + Date.now(),
      category: 'Electronics',
      unitPrice: 500,
      currentStock: 10,
      minimumStock: 12,
      warehouseLocation: 'Zone A'
    };

    const newProductRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(productDataPayload)
    });
    
    const productData = await newProductRes.json();
    console.log('Create Product:', productData.success ? 'OK' : productData);
    const productId = productData.product.id;

    const inRes = await fetch(`${BASE_URL}/products/${productId}/stock-movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ quantity: 5, type: 'IN', reason: 'Restock' })
    });
    console.log('IN 5:', (await inRes.json()).success ? 'OK' : 'FAILED');

    let currentProdRes = await fetch(`${BASE_URL}/products/${productId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    let currentProd = await currentProdRes.json();
    console.log('Stock after IN (Expected 15):', currentProd.product.currentStock === 15 ? 'OK' : 'FAILED');

    const outRes = await fetch(`${BASE_URL}/products/${productId}/stock-movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ quantity: 4, type: 'OUT', reason: 'Sale' })
    });
    console.log('OUT 4:', (await outRes.json()).success ? 'OK' : 'FAILED');

    currentProdRes = await fetch(`${BASE_URL}/products/${productId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    currentProd = await currentProdRes.json();
    console.log('Stock after OUT (Expected 11):', currentProd.product.currentStock === 11 ? 'OK' : 'FAILED');

    const badOutRes = await fetch(`${BASE_URL}/products/${productId}/stock-movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ quantity: 20, type: 'OUT', reason: 'Large Sale' })
    });
    const badOutData = await badOutRes.json();
    console.log('OUT 20 (Expect Error):', badOutRes.status === 400 && badOutData.message === 'Insufficient stock' ? 'OK' : 'FAILED');

    currentProdRes = await fetch(`${BASE_URL}/products/${productId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    currentProd = await currentProdRes.json();
    console.log('Stock after failed OUT (Expected 11):', currentProd.product.currentStock === 11 ? 'OK' : 'FAILED');

    const lowStockRes = await fetch(`${BASE_URL}/products?lowStock=true`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const lowStockData = await lowStockRes.json();
    const found = lowStockData.products.some((p: any) => p.id === productId);
    console.log('Low Stock Filter:', found ? 'OK' : 'FAILED');

    const delRes = await fetch(`${BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Delete Product Guard (Expect 409):', delRes.status === 409 ? 'OK' : 'FAILED');

  } catch (error) {
    console.error('Test error:', error);
  }
}

test();
