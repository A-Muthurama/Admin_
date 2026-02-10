
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ADMINS ---');
    const admins = await prisma.admins.findMany();
    admins.forEach(a => console.log(a));

    console.log('\n--- VENDORS ---');
    const vendors = await prisma.vendors.findMany();
    vendors.forEach(v => console.log(v));
}

main().finally(() => prisma.$disconnect());
