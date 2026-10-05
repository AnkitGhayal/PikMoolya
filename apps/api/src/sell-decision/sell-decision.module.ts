import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { SellDecisionController } from './sell-decision.controller.js';
import { SellDecisionService } from './sell-decision.service.js';

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
  controllers: [SellDecisionController],
  providers: [SellDecisionService],
})
export class SellDecisionModule {}
