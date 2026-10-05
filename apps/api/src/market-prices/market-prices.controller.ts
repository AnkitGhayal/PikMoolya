import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { MarketPricesService } from './market-prices.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('market-prices')
@UseGuards(JwtAuthGuard)
export class MarketPricesController {
  constructor(
    private readonly marketPricesService: MarketPricesService,
  ) {}

  @Get()
  async getLatestPrices(
    @Query('cropId') cropId?: string,
  ) {
    return {
      marketPrices:
        await this.marketPricesService.getLatestPrices(
          cropId,
        ),
    };
  }
}
