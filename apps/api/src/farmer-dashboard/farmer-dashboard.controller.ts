import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { FarmerDashboardService } from './farmer-dashboard.service.js';

@Controller('farmer-dashboard')
@UseGuards(JwtAuthGuard)
export class FarmerDashboardController {
  constructor(
    private readonly farmerDashboardService: FarmerDashboardService,
  ) {}

  @Get()
  getDashboard(@Req() request: any) {
    return this.farmerDashboardService.getDashboard(
      request.user.userId,
    );
  }
}
