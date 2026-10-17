import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { LogisticsRequest } from '../logistics/entities/logistics-request.entity.js';

import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      User,
      ProduceListing,
      Offer,
      Order,
      LogisticsRequest,
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
