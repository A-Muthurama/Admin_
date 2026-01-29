import { Controller, Get, Param, ParseIntPipe, Patch, Body, Post, Delete } from '@nestjs/common';
import { PlansService, UpdatePlanDto, CreatePlanDto } from './plans.service';

@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    /**
     * GET /plans
     * Fetch all available subscription plans for vendor panel
     */
    @Get()
    async getAllPlans() {
        const plans = await this.plansService.getAllPlans();
        return {
            success: true,
            data: plans,
        };
    }

    /**
     * GET /plans/:id
     * Fetch a specific plan by ID
     */
    @Get(':id')
    async getPlanById(@Param('id', ParseIntPipe) id: number) {
        const plan = await this.plansService.getPlanById(id);
        if (!plan) {
            return {
                success: false,
                message: 'Plan not found',
            };
        }
        return {
            success: true,
            data: plan,
        };
    }

    /**
     * POST /plans
     * Create a new plan
     */
    @Post()
    async createPlan(@Body() createData: CreatePlanDto) {
        try {
            const newPlan = await this.plansService.createPlan(createData);
            return {
                success: true,
                message: 'Plan created successfully',
                data: newPlan,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create plan',
                error: error.message,
            };
        }
    }

    /**
     * PATCH /plans/:id
     * Update a plan (Admin only)
     */
    @Patch(':id')
    async updatePlan(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: UpdatePlanDto,
    ) {
        try {
            const updatedPlan = await this.plansService.updatePlan(id, updateData);
            return {
                success: true,
                message: 'Plan updated successfully',
                data: updatedPlan,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update plan',
                error: error.message,
            };
        }
    }

    /**
     * DELETE /plans/:id
     * Delete a plan
     */
    @Delete(':id')
    async deletePlan(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.plansService.deletePlan(id);
            return {
                success: true,
                message: 'Plan deleted successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete plan',
                error: error.message,
            };
        }
    }
}
