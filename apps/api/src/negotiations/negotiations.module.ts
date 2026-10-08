import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NegotiationsController } from './negotiations.controller.js';
import { NegotiationsService } from './negotiations.service.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { Negotiation } from './entities/negotiation.entity.js';
import { FairPriceModule } from '../fair-price/fair-price.module.js';
import { PriceFloorModule } from '../price-floor/price-floor.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([ProduceListing, MarketPrice, Negotiation]),
    FairPriceModule,
    PriceFloorModule,
  ],
  controllers: [NegotiationsController],
  providers: [NegotiationsService],
  exports: [NegotiationsService],
})
export class NegotiationsModule {}
