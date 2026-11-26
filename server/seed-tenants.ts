import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './password';

if (process.env.NODE_ENV === 'production' || process.env.NETSROW_SEED_TEST_TENANTS !== 'true') {
  throw new Error('Enable NETSROW_SEED_TEST_TENANTS only for a local test database');
}

const prisma = new PrismaClient();
try {
  const password = await hashPassword('NetsRow-Local-2026');
  for (const [id, name, product] of [
    ['test-a', 'Comercio A', 'Café de prueba'],
    ['test-b', 'Comercio B', 'Pintura de prueba'],
  ]) {
    const canManageCatalog = id === 'test-a';
    await prisma.company.upsert({
      where: { id },
      update: {
        accounts: { updateMany: { where: { email: `${id}@example.test` }, data: { canManageCatalog } } },
      },
      create: {
        id, name,
        accounts: { create: { email: `${id}@example.test`, password, canManageCatalog } },
        products: { create: { id: `${id}-product`, name: product } },
      },
    });
  }
} finally {
  await prisma.$disconnect();
}
