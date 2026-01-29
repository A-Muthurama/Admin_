import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
    try {
        console.log('🌱 Seeding plans table...');

        // Clear existing plans
        await prisma.plans.deleteMany({});
        console.log('✅ Cleared existing plans');

        // Insert the 4 subscription plans
        const plans = await prisma.plans.createMany({
            data: [
                { name: 'Starter', price: 299, posts: 5, months: 1 },
                { name: 'Growth', price: 399, posts: 8, months: 1 },
                { name: 'Professional', price: 599, posts: 15, months: 3 },
                { name: 'Enterprise', price: 999, posts: 30, months: 6 },
            ],
        });

        console.log(`✅ Created ${plans.count} subscription plans`);

        // Verify the data
        const allPlans = await prisma.plans.findMany();
        console.log('\n📋 Current plans in database:');
        allPlans.forEach((plan) => {
            console.log(
                `  - ${plan.name}: ₹${plan.price} | ${plan.posts} posts | ${plan.months} month(s)`,
            );
        });

        console.log('\n✨ Plans seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding plans:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedPlans();
