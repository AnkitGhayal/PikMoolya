import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { AuthModule } from './auth/auth.module.js';
import { User } from './users/entities/user.entity.js';

import { Farmer } from './farmers/entities/farmer.entity.js';
import { FarmersModule } from './farmers/farmers.module.js';

import { CropsModule } from './crops/crops.module.js';
import { Crop } from './crops/entities/crop.entity.js';

import { ProduceModule } from './produce/produce.module.js';
import { ProduceListing } from './produce/entities/produce-listing.entity.js';

import { Auction } from './auctions/entities/auction.entity.js';
import { AuctionBid } from './auctions/entities/auction-bid.entity.js';

import { MarketPricesModule } from './market-prices/market-prices.module.js';
import { PricePredictionsModule } from './price-predictions/price-predictions.module.js';
import { MarketPrice } from './market-prices/entities/market-price.entity.js';
import { PricePrediction } from './price-predictions/entities/price-prediction.entity.js';
import { PriceFloorModule } from './price-floor/price-floor.module.js';
import { FairPriceModule } from './fair-price/fair-price.module.js';
import { SellDecisionModule } from './sell-decision/sell-decision.module.js';
import { MarketOptimizerModule } from './market-optimizer/market-optimizer.module.js';
import { RiskAnalysisModule } from './risk-analysis/risk-analysis.module.js';
import { FarmerDashboardModule } from './farmer-dashboard/farmer-dashboard.module.js';
import { BuyerDashboardModule } from './buyer-dashboard/buyer-dashboard.module.js';
import { OffersModule } from './offers/offers.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { QualityChainModule } from './quality-chain/quality-chain.module.js';

import { Order } from './orders/entities/order.entity.js';
import { Offer } from './offers/entities/offer.entity.js';
import { ProducePassport } from './produce-passports/entities/produce-passport.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        entities: [
          User,
          Farmer,
          Crop,
          ProduceListing,
          Auction,
          AuctionBid,
          Offer,
          Order,
          ProducePassport,
          MarketPrice,
          PricePrediction,
        ],

        synchronize: false,
        logging: ['error'],
      }),
    }),

    AuthModule,
    FarmersModule,
    CropsModule,
    ProduceModule,
    MarketPricesModule,
    PricePredictionsModule,
    PriceFloorModule,
    FairPriceModule,
    SellDecisionModule,
    MarketOptimizerModule,
    RiskAnalysisModule,
    FarmerDashboardModule,
    BuyerDashboardModule,
    OffersModule,
    OrdersModule,
    QualityChainModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}





