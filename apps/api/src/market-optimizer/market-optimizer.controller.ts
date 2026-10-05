import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { FindBestMarketDto } from './dto/find-best-market.dto.js';
import { MarketOptimizerService } from './market-optimizer.service.js';

@Controller('market-optimizer')
@UseGuards(JwtAuthGuard)
export class MarketOptimizerController {
  constructor(
    private readonly marketOptimizerService: MarketOptimizerService,
  ) {}

  @Post('best-market')
  findBestMarket(@Body() dto: FindBestMarketDto) {
    return this.marketOptimizerService.findBestMarket(dto);
  }
}
