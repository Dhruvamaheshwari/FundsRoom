import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding development users...');
  
  // NOTE: These are development credentials ONLY. Do not use in production.
  const password = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password,
      role: UserRole.ADMIN,
    },
    {
      name: 'Sales Rep',
      email: 'sales@example.com',
      password,
      role: UserRole.SALES,
    },
    {
      name: 'Warehouse Manager',
      email: 'warehouse@example.com',
      password,
      role: UserRole.WAREHOUSE,
    },
    {
      name: 'Accounts Executive',
      email: 'accounts@example.com',
      password,
      role: UserRole.ACCOUNTS,
    },
  ];

  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Created test user: ${createdUser.email} [${createdUser.role}]`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
