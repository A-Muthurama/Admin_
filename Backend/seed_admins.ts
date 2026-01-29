
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('Admin@496', 10);

    const emails = [
        'admin@jewellery.com',
        'vinodkarthik2005@gmail.com',
        'jewelproject10@gmail.com'
    ];

    console.log('Seeding Admins...');

    for (const email of emails) {
        const existing = await prisma.admins.findUnique({ where: { email } });
        if (!existing) {
            await prisma.admins.create({
                data: {
                    email,
                    password,
                },
            });
            console.log(`Created admin: ${email}`);
        } else {
            console.log(`Admin already exists: ${email}`);
            // Update password just in case
            await prisma.admins.update({
                where: { email },
                data: { password }
            });
            console.log(`Updated password for: ${email}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
