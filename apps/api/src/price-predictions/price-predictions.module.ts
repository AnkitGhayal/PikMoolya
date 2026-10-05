import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PricePrediction } from './entities/price-prediction.entity.js';
import { PricePredictionsController } from './price-predictions.controller.js';
import { PricePredictionsService } from './price-predictions.service.js';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    TypeOrmModule.forFeature([
      PricePrediction,
      Crop,
      MarketPrice,
    ]),
  ],
  controllers: [PricePredictionsController],
  providers: [PricePredictionsService],
  exports: [PricePredictionsService],
})
export class PricePredictionsModule {}
