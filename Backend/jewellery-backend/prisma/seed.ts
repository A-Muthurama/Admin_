import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmails = ['admin@jewellery.com', 'vinodkarthik2005@gmail.com'];
  const hashedPassword = await bcrypt.hash('admin123', 10);

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: Role.ADMIN,
      },
      create: {
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
  }

  console.log(`Seeded ${adminEmails.length} admin account(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
