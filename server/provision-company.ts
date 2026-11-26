import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword } from './password';

const [companyInput, emailInput, branchInput = 'Sucursal principal'] = process.argv.slice(2);
const name = companyInput?.trim();
const email = emailInput?.trim().toLowerCase();
const branchName = branchInput.trim();
const password = process.env.NETSROW_OWNER_PASSWORD;

if (!name || name.length > 120 || !email || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !branchName || branchName.length > 120 || !password || password.length < 12 || password.length > 256) {
  console.error('Indica empresa, correo y sucursal válidos. NETSROW_OWNER_PASSWORD debe tener de 12 a 256 caracteres.');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const company = await prisma.company.create({
    data: {
      name,
      primaryBranch: { create: { name: branchName } },
      accounts: { create: { email, password: await hashPassword(password), canManageCatalog: true, canManageCompany: true } },
    },
    select: { id: true, name: true },
  });
  console.log(`Empresa creada: ${company.name} (${company.id})`);
} catch (error) {
  console.error(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
    ? 'El correo ya pertenece a una cuenta. No se creó otra empresa.'
    : 'No se pudo crear la empresa. Revisa la conexión y las migraciones.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
