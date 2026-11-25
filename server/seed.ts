import 'dotenv/config';
import { PrismaClient, type Prisma } from '@prisma/client';
import { SEED_COMMERCIAL_CATALOG } from '../src/netsrow-payroll/data/commercialCatalog';

const prisma = new PrismaClient();

try {
  await prisma.catalogSnapshot.upsert({
    where: { key: 'demo' },
    create: { key: 'demo', payload: JSON.parse(JSON.stringify(SEED_COMMERCIAL_CATALOG)) as Prisma.InputJsonObject },
    update: {},
  });
} finally {
  await prisma.$disconnect();
}
