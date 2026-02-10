
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const vendors = await prisma.vendors.findMany();

    console.log('--- Vendors in DB ---');
    if (vendors.length === 0) {
        console.log('No vendors found.');
    } else {
        vendors.forEach(v => {
            console.log(`ID: ${v.id}, Owner: ${v.owner_name}, Shop: ${v.shop_name}, Status: ${v.status}, Email: ${v.email}`);
        });
    }

    console.log('--- Admins in DB ---');
    const admins = await prisma.admins.findMany();
    console.log(`Count: ${admins.length}`);
    admins.forEach(a => console.log(` - ${a.email}`));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
