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

function createProduct(name: string, cookie?: string, extra: Record<string, string> = {}) {
  return fetch(`${endpoint}/catalog`, {
    method: 'POST',
    headers: { ...headers, ...(cookie ? { cookie } : {}) },
    body: JSON.stringify({ name, ...extra }),
  });
}

assert.equal((await fetch(`${endpoint}/catalog`)).status, 401);
assert.equal((await createProduct('Sin sesión')).status, 401);
assert.equal((await login('test-a@example.test', 'incorrect')).status, 401);

let createdProductId = '';
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
    const { products, canManageCatalog } = body as {
      products: Array<{ id: string }>;
      canManageCatalog: boolean;
    };
    assert.equal(canManageCatalog, tenant === 'test-a');
    assert.deepEqual(products.map(({ id }) => id), [`${tenant}-product`]);
  }

  assert.equal((await fetch(`${endpoint}/catalog/${other}-product`, { headers: { cookie } })).status, 404);
  if (tenant === 'test-a') {
    assert.equal((await createProduct('  ', cookie)).status, 400);
    const created = await createProduct('  Producto Fase 4  ', cookie, { companyId: other });
    assert.equal(created.status, 201);
    const product = await created.json() as { id: string; name: string };
    createdProductId = product.id;
    assert.equal(product.name, 'Producto Fase 4');
    const persisted = await fetch(`${endpoint}/catalog/${createdProductId}`, { headers: { cookie } });
    assert.equal(persisted.status, 200);
    assert.deepEqual(await persisted.json(), product);
  } else {
    assert.equal((await createProduct('Sin permiso', cookie)).status, 403);
    assert.ok(createdProductId);
    assert.equal((await fetch(`${endpoint}/catalog/${createdProductId}`, { headers: { cookie } })).status, 404);
  }

  assert.equal((await fetch(`${endpoint}/logout`, {
    method: 'POST',
    headers: { ...headers, cookie },
  })).status, 204);
  assert.equal((await fetch(`${endpoint}/catalog`, { headers: { cookie } })).status, 401);
}

console.log('Tenant sign-in, isolated catalog, product creation permissions and logout verified');
