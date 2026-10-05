import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { PricePrediction } from '../price-predictions/entities/price-prediction.entity.js';

import { FairPriceController } from './fair-price.controller.js';
import { FairPriceService } from './fair-price.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    TypeOrmModule.forFeature([
      Crop,
      MarketPrice,
      PricePrediction,
    ]),
  ],

  controllers: [FairPriceController],

  providers: [FairPriceService],

  exports: [FairPriceService],
})
export class FairPriceModule {}
