import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePlanDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    posts?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    months?: number;
}

export class CreatePlanDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    posts: number;

    @IsNumber()
    @Min(1)
    months: number;
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
            orderBy: { id: 'asc' }, // Sort by ID to keep order stable
            select: {
                id: true,
                name: true,
                price: true,
                posts: true,
                months: true,
                created_at: true,
                updated_at: true,
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
     * Create a new plan (Admin only)
     */
    async createPlan(data: CreatePlanDto) {
        return this.prisma.plans.create({
            data: {
                name: data.name,
                price: data.price,
                posts: data.posts,
                months: data.months,
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
                ...(data.name !== undefined && { name: data.name }),
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

    /**
     * Delete a plan (Admin only)
     */
    async deletePlan(id: number) {
        return this.prisma.plans.delete({
            where: { id },
        });
    }
}
