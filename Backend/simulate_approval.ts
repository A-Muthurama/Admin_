
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('SimulateApproval');

async function main() {
    const vendorId = 2; // Try ID 2 or whatever ID exists and is pending

    console.log(`Simulating approval for vendor ${vendorId}...`);

    try {
        const vendor = await prisma.vendors.findUnique({ where: { id: vendorId } });
        if (!vendor) {
            console.log(`Vendor ${vendorId} not found.`);
            return;
        }
        console.log(`Found vendor. Current status: ${vendor.status}, ApprovedAt: ${vendor.approved_at}`);

        // Calculate days since creation
        const now = new Date();
        const createdAt = vendor.created_at || now;
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Convert to IST for storage (UTC + 5:30)
        const istOffset = 5.5 * 60 * 60 * 1000;
        const approvedAtIST = new Date(now.getTime() + istOffset);

        console.log(`Updating with: approved_at=${approvedAtIST.toISOString()}, days_count=${daysCount}`);

        // Update status to 'APPROVED'
        const updated = await prisma.vendors.update({
            where: { id: vendorId },
            data: {
                status: 'APPROVED',
                approved_at: approvedAtIST,
                days_count: daysCount
            },
        });

        console.log('Update complete.');
        // @ts-ignore
        console.log(`New Status: ${updated.status}, New ApprovedAt: ${updated.approved_at}, New DaysCount: ${updated.days_count}`);

    } catch (error) {
        console.error('Error during simulation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
