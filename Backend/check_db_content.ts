
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking "vendors" table (Original) ---');
    const originalVendors = await prisma.vendors.findMany();
    console.log(`Count: ${originalVendors.length}`);
    originalVendors.forEach(v => {
        console.log(`[${v.id}] ${v.shop_name} (${v.owner_name}) - Email: ${v.email}, Status: ${v.status}`);
    });

    console.log('\n--- Checking "VendorProfile" table (New) ---');
    const profiles = await prisma.vendorProfile.findMany({ include: { user: true } });
    console.log(`Count: ${profiles.length}`);
    profiles.forEach(p => {
        console.log(`[${p.id}] ${p.shopName} (${p.ownerName}) - Status: ${p.status}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
