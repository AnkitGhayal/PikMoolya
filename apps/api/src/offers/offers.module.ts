import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';
import { Offer } from './entities/offer.entity.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { NegotiationsModule } from '../negotiations/negotiations.module.js';
import { Negotiation } from '../negotiations/entities/negotiation.entity.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Offer, ProduceListing, Negotiation]),
    NegotiationsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
