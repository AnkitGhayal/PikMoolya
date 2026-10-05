import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { Auction } from '../auctions/entities/auction.entity.js';
import { AuctionBid } from '../auctions/entities/auction-bid.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { User } from '../users/entities/user.entity.js';
import { BuyerMatchingService } from '../buyer-matching/buyer-matching.service.js';

import { BuyerDashboardController } from './buyer-dashboard.controller.js';
import { BuyerDashboardService } from './buyer-dashboard.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      ProduceListing,
      Auction,
      AuctionBid,
      Crop,
      User,
    ]),
  ],
  controllers: [BuyerDashboardController],
  providers: [
    BuyerDashboardService,
    BuyerMatchingService,
  ],
})
export class BuyerDashboardModule {}
