import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { MarketOptimizerController } from './market-optimizer.controller.js';
import { MarketOptimizerService } from './market-optimizer.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      Crop,
      MarketPrice,
    ]),
  ],
  controllers: [MarketOptimizerController],
  providers: [MarketOptimizerService],
})
export class MarketOptimizerModule {}
