import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { ProducePassport } from '../produce-passports/entities/produce-passport.entity.js';
import { QualityChainController } from './quality-chain.controller.js';
import { QualityChainService } from './quality-chain.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      ProduceListing,
      ProducePassport,
    ]),
  ],
  controllers: [QualityChainController],
  providers: [QualityChainService],
  exports: [QualityChainService],
})
export class QualityChainModule {}
