import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class UpdatePlanDto {
    price?: number;
    posts?: number;
    months?: number;
}

@Injectable()
export class PlansService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all available subscription plans
     * This endpoint is used by the vendor panel to display subscription options
     */
    async getAllPlans() {
        return this.prisma.plans.findMany({
            orderBy: { price: 'asc' },
            select: {
                id: true,
                name: true,
                price: true,
                posts: true,
                months: true,
            },
        });
    }

    /**
     * Get a specific plan by ID
     */
    async getPlanById(id: number) {
        return this.prisma.plans.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                price: true,
                posts: true,
                months: true,
            },
        });
    }

    /**
     * Update a plan (Admin only)
     * Allows admin to modify plan price, posts, and duration
     */
    async updatePlan(id: number, data: UpdatePlanDto) {
        return this.prisma.plans.update({
            where: { id },
            data: {
                ...(data.price !== undefined && { price: data.price }),
                ...(data.posts !== undefined && { posts: data.posts }),
                ...(data.months !== undefined && { months: data.months }),
            },
            select: {
                id: true,
                name: true,
                price: true,
                posts: true,
                months: true,
            },
        });
    }
}
