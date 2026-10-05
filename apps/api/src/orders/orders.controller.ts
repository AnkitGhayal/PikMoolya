import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OrdersService } from './orders.service.js';
import { OrderStatus } from './entities/order.entity.js';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('from-offer/:offerId')
  createFromOffer(
    @Req() request: any,
    @Param('offerId') offerId: string,
  ) {
    return this.ordersService.createFromAcceptedOffer(
      request.user.userId,
      offerId,
    );
  }

  @Get('my')
  getMyOrders(@Req() request: any) {
    return this.ordersService.getMyOrders(request.user.userId);
  }

  @Get(':id')
  getOrder(
    @Req() request: any,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.getOrder(
      request.user.userId,
      orderId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Req() request: any,
    @Param('id') orderId: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(
      request.user.userId,
      orderId,
      status,
    );
  }
}
