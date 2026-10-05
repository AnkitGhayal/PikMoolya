import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from './entities/market-price.entity.js';
import { MarketPricesController } from './market-prices.controller.js';
import { MarketPricesService } from './market-prices.service.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([MarketPrice, Crop]),
  ],
  controllers: [MarketPricesController],
  providers: [MarketPricesService],
  exports: [MarketPricesService],
})
export class MarketPricesModule {}
