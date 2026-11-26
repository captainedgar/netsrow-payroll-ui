import assert from 'node:assert/strict';

const endpoint = 'http://127.0.0.1:3000/api/tenant';
const headers = { 'Content-Type': 'application/json', 'X-Netsrow-Client': 'web' };

function login(email: string, password: string) {
  return fetch(`${endpoint}/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });
}

assert.equal((await fetch(`${endpoint}/catalog`)).status, 401);
assert.equal((await login('test-a@example.test', 'incorrect')).status, 401);

for (const [tenant, other] of [['test-a', 'test-b'], ['test-b', 'test-a']]) {
  const response = await login(`${tenant}@example.test`, 'NetsRow-Local-2026');
  assert.equal(response.status, 200);
  const cookieHeader = response.headers.get('set-cookie');
  assert.ok(cookieHeader);
  assert.match(cookieHeader, /HttpOnly/i);
  const cookie = cookieHeader.split(';', 1)[0];

  for (let request = 0; request < 2; request++) {
    const catalog = await fetch(`${endpoint}/catalog`, { headers: { cookie } });
    assert.equal(catalog.status, 200);
    const body: unknown = await catalog.json();
    const { products } = body as { products: Array<{ id: string }> };
    assert.deepEqual(products.map(({ id }) => id), [`${tenant}-product`]);
  }

  assert.equal((await fetch(`${endpoint}/catalog/${other}-product`, { headers: { cookie } })).status, 404);
  assert.equal((await fetch(`${endpoint}/logout`, {
    method: 'POST',
    headers: { ...headers, cookie },
  })).status, 204);
  assert.equal((await fetch(`${endpoint}/catalog`, { headers: { cookie } })).status, 401);
}

console.log('Tenant sign-in, isolated catalog and logout verified');
