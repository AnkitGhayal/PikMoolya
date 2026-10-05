import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BuyerDashboardService } from './buyer-dashboard.service.js';

@Controller('buyer-dashboard')
@UseGuards(JwtAuthGuard)
export class BuyerDashboardController {
  constructor(
    private readonly buyerDashboardService: BuyerDashboardService,
  ) {}

  @Get()
  getDashboard(@Req() request: any) {
    return this.buyerDashboardService.getDashboard(request.user.userId);
  }
}
