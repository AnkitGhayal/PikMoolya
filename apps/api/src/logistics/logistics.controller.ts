import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LogisticsService } from './logistics.service.js';
import { LogisticsStatus } from './entities/logistics-request.entity.js';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('requests')
  async getRequests(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.logisticsService.getRequests(userId, req.user?.role);
  }

  @Patch('requests/:id/accept')
  async acceptRequest(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.logisticsService.acceptRequest(userId, id);
  }

  @Patch('requests/:id/reject')
  async rejectRequest(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.logisticsService.rejectRequest(userId, id);
  }

  @Patch('requests/:id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: LogisticsStatus,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.logisticsService.updateStatus(userId, id, status);
  }
}
