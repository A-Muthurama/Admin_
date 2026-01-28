
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const v = await prisma.vendors.findFirst({ where: { id: 1 } });
    console.log('Malabar Gold Status:', v?.status);
}

main().finally(() => prisma.$disconnect());
