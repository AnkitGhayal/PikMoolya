import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { Farmer } from '../farmers/entities/farmer.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProduceListing, Farmer, Crop]),
    AiModule,
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
