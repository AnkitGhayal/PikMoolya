import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { ProducePassport } from './entities/produce-passport.entity.js';
import { ProducePassportsController } from './produce-passports.controller.js';
import { PublicProducePassportsController } from './public-produce-passports.controller.js';
import { ProducePassportsService } from './produce-passports.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      ProduceListing,
    ]),
  ],
  controllers: [ProducePassportsController, PublicProducePassportsController],
  providers: [ProducePassportsService],
})
export class ProducePassportsModule {}





