import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { Auction } from './entities/auction.entity.js';
import { AuctionBid } from './entities/auction-bid.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AuctionsController } from './auctions.controller.js';
import { AuctionsService } from './auctions.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      ProduceListing,
      User,
    ]),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService],
})
export class AuctionsModule {}

