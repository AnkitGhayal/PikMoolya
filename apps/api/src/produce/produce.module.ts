import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduceListing } from './entities/produce-listing.entity.js';
import { ProduceController } from './produce.controller.js';
import { ProduceService } from './produce.service.js';
import { Farmer } from '../farmers/entities/farmer.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { PriceFloorModule } from '../price-floor/price-floor.module.js';
import { FairPriceModule } from '../fair-price/fair-price.module.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      ProduceListing,
      Farmer,
      Crop,
    ]),
    PriceFloorModule,
    FairPriceModule,
  ],
  controllers: [ProduceController],
  providers: [ProduceService],
  exports: [ProduceService],
})
export class ProduceModule {}

