
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ALL VENDORS ---');
    const vendors = await prisma.vendors.findMany();
    console.log(vendors);

    console.log('\n--- ALL USERS ---');
    try {
        const users = await (prisma as any).user.findMany();
        console.log(users);
    } catch (e) {
        console.log('User table not accessible');
    }
}

main().finally(() => prisma.$disconnect());
