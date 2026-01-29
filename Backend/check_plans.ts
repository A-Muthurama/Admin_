import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPlans() {
    try {
        console.log('🔍 Checking plans table...\n');

        const plans = await prisma.plans.findMany({
            orderBy: { price: 'asc' },
        });

        if (plans.length === 0) {
            console.log('⚠️  No plans found in database');
            return;
        }

        console.log(`✅ Found ${plans.length} plans:\n`);

        plans.forEach((plan, index) => {
            console.log(`${index + 1}. ${plan.name}`);
            console.log(`   ID: ${plan.id}`);
            console.log(`   Price: ₹${plan.price}`);
            console.log(`   Posts: ${plan.posts}`);
            console.log(`   Duration: ${plan.months} month(s)`);
            console.log(`   Created: ${plan.created_at}`);
            console.log('');
        });

        console.log('✨ Plans table is ready for vendor panel!');
    } catch (error) {
        console.error('❌ Error checking plans:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

checkPlans();
