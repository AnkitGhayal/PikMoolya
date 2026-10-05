import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PricePredictionsService } from './price-predictions.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('price-predictions')
@UseGuards(JwtAuthGuard)
export class PricePredictionsController {
  constructor(
    private readonly pricePredictionsService: PricePredictionsService,
  ) {}

  @Get('latest')
  async getLatestPrediction(
    @Query('cropId') cropId?: string,
  ) {
    if (!cropId) {
      return {
        message: 'cropId query parameter is required',
      };
    }

    return this.pricePredictionsService.getLatestPrediction(
      cropId,
    );
  }
}
