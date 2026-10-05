import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Farmer } from './entities/farmer.entity.js';
import { FarmersService } from './farmers.service.js';
import { FarmersController } from './farmers.controller.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([Farmer]),
  ],

  controllers: [FarmersController],

  providers: [FarmersService],

  exports: [FarmersService],
})
export class FarmersModule {}