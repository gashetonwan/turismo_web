require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@turismo.com';
  const adminPassword = 'admin123';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin ya existe');
    return;
  }
  const hashed = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: { email: adminEmail, password: hashed, role: 'ADMIN' }
  });
  console.log('Admin creado:', adminEmail);
}

main().catch(console.error);
