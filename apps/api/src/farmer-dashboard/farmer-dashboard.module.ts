import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { Farmer } from '../farmers/entities/farmer.entity.js';
import { PriceFloorModule } from '../price-floor/price-floor.module.js';

import { FarmerDashboardController } from './farmer-dashboard.controller.js';
import { FarmerDashboardService } from './farmer-dashboard.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([ProduceListing, Farmer]),
    PriceFloorModule,
  ],
  controllers: [FarmerDashboardController],
  providers: [FarmerDashboardService],
})
export class FarmerDashboardModule {}
