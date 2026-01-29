import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAddPlan() {
    try {
        console.log('🧪 Testing Add Plan functionality...\n');

        // Test data
        const testPlan = {
            name: 'Test Plan',
            price: 199,
            posts: 7,
            months: 2
        };

        console.log('📝 Creating plan with data:', testPlan);

        const newPlan = await prisma.plans.create({
            data: testPlan
        });

        console.log('✅ Plan created successfully!');
        console.log('📋 Created plan:', newPlan);

        // Verify it was created
        const allPlans = await prisma.plans.findMany({
            orderBy: { id: 'desc' },
            take: 1
        });

        console.log('\n📊 Latest plan in database:', allPlans[0]);

        // Clean up - delete the test plan
        await prisma.plans.delete({
            where: { id: newPlan.id }
        });

        console.log('\n🧹 Test plan deleted successfully');
        console.log('✨ Add Plan functionality is working correctly!');

    } catch (error) {
        console.error('❌ Error testing add plan:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testAddPlan();
