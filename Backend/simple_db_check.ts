
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking "vendors" table ---');
    try {
        const originalVendors = await prisma.vendors.findMany();
        console.log(`Count: ${originalVendors.length}`);
        originalVendors.forEach(v => {
            console.log(`[${v.id}] ${v.shop_name} - Phone: ${v.phone}, Email: ${v.email}, Status: ${v.status}`);
        });
    } catch (e: any) {
        console.error('Error fetching vendors:', e.message);
    }
}

main().finally(() => prisma.$disconnect());
