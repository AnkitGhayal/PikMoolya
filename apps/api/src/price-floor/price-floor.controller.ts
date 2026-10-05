import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { PriceFloorService } from './price-floor.service.js';
import { CalculatePriceFloorDto } from './dto/calculate-price-floor.dto.js';

@Controller('price-floor')
@UseGuards(JwtAuthGuard)
export class PriceFloorController {
  constructor(
    private readonly priceFloorService: PriceFloorService,
  ) {}

  @Post('calculate')
  calculatePriceFloor(
    @Body() dto: CalculatePriceFloorDto,
  ) {
    return this.priceFloorService.calculatePriceFloor(
      dto,
    );
  }

  @Post('compare-offer')
  compareOffer(
    @Body()
    body: {
      priceFloor: number;
      buyerOffer: number;
    },
  ) {
    return this.priceFloorService.compareOffer(
      body.priceFloor,
      body.buyerOffer,
    );
  }
}
