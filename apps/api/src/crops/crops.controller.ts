import { Controller, Get, UseGuards } from '@nestjs/common';

import { CropsService } from './crops.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('crops')
export class CropsController {
  constructor(
    private readonly cropsService: CropsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getActiveCrops() {
    return {
      crops: await this.cropsService.getActiveCrops(),
    };
  }
}
