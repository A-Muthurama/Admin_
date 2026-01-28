
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- VENDORS Content ---');
    const vendors = await prisma.vendors.findMany();
    console.log(JSON.stringify(vendors, null, 2));

    console.log('\n--- OFFERS Content ---');
    const offers = await prisma.offers.findMany();
    console.log(JSON.stringify(offers, null, 2));
}

main().finally(() => prisma.$disconnect());
