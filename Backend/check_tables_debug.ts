
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- TABLES CHECK ---');
    try {
        const vendorsTable = await prisma.vendors.findMany();
        console.log('vendors table count:', vendorsTable.length);
        console.log(vendorsTable);
    } catch (e) {
        console.log('vendors table error:', e.message);
    }

    // VendorProfile model doesn't exist - using 'vendors' table only
}

main().finally(() => prisma.$disconnect());
