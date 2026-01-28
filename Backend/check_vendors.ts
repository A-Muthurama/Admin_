
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const vendors = await prisma.vendorProfile.findMany({
        include: {
            user: true
        }
    });

    console.log('--- Vendors in DB ---');
    if (vendors.length === 0) {
        console.log('No vendors found.');
    } else {
        vendors.forEach(v => {
            console.log(`ID: ${v.id}, Owner: ${v.ownerName}, Status: ${v.status}, UserRole: ${v.user.role}, Email: ${v.user.email}`);
        });
    }

    const users = await prisma.user.findMany();
    console.log('--- Users in DB ---');
    console.log(`Count: ${users.length}`);
    users.forEach(u => console.log(` - ${u.email} (${u.role})`));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
