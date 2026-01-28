
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

    try {
        const vendorProfileTable = await prisma.vendorProfile.findMany();
        console.log('VendorProfile table count:', vendorProfileTable.length);
        console.log(vendorProfileTable);
    } catch (e) {
        console.log('VendorProfile table error:', e.message);
    }
}

main().finally(() => prisma.$disconnect());
