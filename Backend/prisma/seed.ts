import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmails = ['admin@jewellery.com', 'vinodkarthik2005@gmail.com', 'jewelproject10@gmail.com'];
  const hashedPassword = await bcrypt.hash('Admin@496', 10);

  console.log('🌱 Seeding database...');

  // 1. Seed Admin accounts
  for (const email of adminEmails) {
    await prisma.admins.upsert({
      where: { email },
      update: {
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
      },
    });
  }
  console.log(`✅ Seeded ${adminEmails.length} admin account(s)`);

  // 2. Seed Plans
  const plans = [
    { name: 'Starter', price: 299, posts: 5, months: 1 },
    { name: 'Growth', price: 399, posts: 8, months: 1 },
    { name: 'Professional', price: 599, posts: 15, months: 3 },
    { name: 'Enterprise', price: 999, posts: 30, months: 6 },
  ];

  for (const plan of plans) {
    // Check if plan already exists by name
    const existingPlan = await prisma.plans.findFirst({
      where: { name: plan.name }
    });

    if (!existingPlan) {
      await prisma.plans.create({ data: plan });
      console.log(`✅ Created plan: ${plan.name}`);
    } else {
      // Update existing plan properties
      await prisma.plans.update({
        where: { id: existingPlan.id },
        data: plan
      });
      console.log(`✅ Updated plan: ${plan.name}`);
    }
  }

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
