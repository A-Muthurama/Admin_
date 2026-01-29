import { Controller, Get, Param, ParseIntPipe, Patch, Body } from '@nestjs/common';
import { PlansService, UpdatePlanDto } from './plans.service';

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
}
