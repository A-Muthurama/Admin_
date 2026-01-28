
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany();
    users.forEach(u => console.log(u));

    console.log('\n--- VENDOR PROFILES ---');
    const profiles = await prisma.vendorProfile.findMany();
    profiles.forEach(p => console.log(p));

    console.log('\n--- VENDORS (Legacy) ---');
    const vendors = await prisma.vendors.findMany();
    vendors.forEach(v => console.log(v));
}

main().finally(() => prisma.$disconnect());
