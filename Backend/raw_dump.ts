
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tables: any = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables:', tables.map((t: any) => t.table_name));

    for (const t of tables) {
        const name = t.table_name;
        console.log(`\n--- Content of ${name} ---`);
        try {
            const content = await prisma.$queryRawUnsafe(`SELECT * FROM "${name}" LIMIT 5`);
            console.log(content);
        } catch (e) {
            console.error(`Failed to read ${name}:`, e.message);
        }
    }
}

main().finally(() => prisma.$disconnect());
