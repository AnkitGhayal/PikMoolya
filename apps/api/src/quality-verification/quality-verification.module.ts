import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { QualityVerificationController } from './quality-verification.controller.js';
import { QualityVerificationService } from './quality-verification.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      ProduceListing,
    ]),
  ],
  controllers: [QualityVerificationController],
  providers: [QualityVerificationService],
})
export class QualityVerificationModule {}
