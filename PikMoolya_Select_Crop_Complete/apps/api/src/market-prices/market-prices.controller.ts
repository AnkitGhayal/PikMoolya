import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { MarketPricesService } from './market-prices.service.js';
import { MarketPriceQueryDto } from './dto/market-price-query.dto.js';

@Controller('market-prices')
@UseGuards(JwtAuthGuard)
export class MarketPricesController {
  constructor(private readonly marketPricesService: MarketPricesService) {}

  @Get()
  getPrices(@Query() query: MarketPriceQueryDto) {
    return this.marketPricesService.getPrices(query);
  }

  @Post('sync-maharashtra')
  syncMaharashtra(@Req() request: any) {
    return this.marketPricesService.syncMaharashtra();
  }
}
