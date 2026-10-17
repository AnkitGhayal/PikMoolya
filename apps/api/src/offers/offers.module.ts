import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';
import { Offer } from './entities/offer.entity.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { NegotiationsModule } from '../negotiations/negotiations.module.js';
import { Negotiation } from '../negotiations/entities/negotiation.entity.js';

import { OrdersModule } from '../orders/orders.module.js';
import { LogisticsModule } from '../logistics/logistics.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Offer, ProduceListing, Negotiation]),
    NegotiationsModule,
    OrdersModule,
    LogisticsModule,
    NotificationsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
