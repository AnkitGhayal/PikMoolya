import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsRequest } from './entities/logistics-request.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { LogisticsService } from './logistics.service.js';
import { LogisticsController } from './logistics.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([LogisticsRequest, Order]),
    NotificationsModule,
  ],
  providers: [LogisticsService],
  controllers: [LogisticsController],
  exports: [LogisticsService],
})
export class LogisticsModule {}
