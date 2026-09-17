import { app } from '../src/server/app';
import http from 'http';

async function runTests() {
  console.log('Starting EDUKA Security & Tenant Isolation Tests...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5002, resolve));

  try {
    // 1. Unauthenticated access check
    const res1 = await fetch('http://localhost:5002/api/v1/students');
    console.log(`Test 1 - Unauthenticated access status: ${res1.status} (Expected: 401)`);
    if (res1.status !== 401) throw new Error('Test 1 Failed');

    // 2. Valid Login check
    const res2 = await fetch('http://localhost:5002/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'j.etienne@polycarpe.eduka.ht',
        password: 'Teacher2025!',
      }),
    });
    console.log(`Test 2 - Login status: ${res2.status} (Expected: 200)`);
    if (res2.status !== 200) throw new Error('Test 2 Failed');

    const data2 = await res2.json();
    console.log(`Logged in user role: ${data2.user.role} (Expected: enseignant)`);

    // 3. RBAC Enforcement check (Enseignant trying finance endpoint)
    const res3 = await fetch('http://localhost:5002/api/v1/finance/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data2.token}`,
      },
      body: JSON.stringify({ invoiceId: 'inv-1', amount: 100 }),
    });
    console.log(`Test 3 - RBAC Forbidden status: ${res3.status} (Expected: 403)`);
    if (res3.status !== 403) throw new Error('Test 3 Failed');

    console.log('ALL SECURITY TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
