import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketPrice } from './entities/market-price.entity.js';
import { MarketPricesController } from './market-prices.controller.js';
import { MarketPricesService } from './market-prices.service.js';
import { Crop } from '../crops/entities/crop.entity.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    TypeOrmModule.forFeature([
      MarketPrice,
      Crop,
    ]),
  ],
  controllers: [MarketPricesController],
  providers: [MarketPricesService],
  exports: [MarketPricesService],
})
export class MarketPricesModule {}
