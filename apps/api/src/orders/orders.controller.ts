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
    @Body()
    body?: {
      logisticsRequired?: boolean;
      logisticsCost?: number;
      logisticsPayer?: string;
      pickupDetails?: string;
      deliveryDetails?: string;
    },
  ) {
    return this.ordersService.createFromAcceptedOffer(
      request.user.userId,
      offerId,
      body,
    );
  }

  @Get()
  getAllOrders(@Req() request: any) {
    return this.ordersService.getMyOrders(request.user.userId);
  }

  @Post()
  createDirectOrder(
    @Req() request: any,
    @Body()
    body: {
      productId: string;
      quantity: number;
      price?: number;
      logisticsRequired?: boolean;
      logisticsCost?: number;
      logisticsPayer?: string;
      pickupDetails?: string;
      deliveryDetails?: string;
    },
  ) {
    return this.ordersService.createDirectOrder(
      request.user.userId,
      body.productId,
      Number(body.quantity),
      body.price ? Number(body.price) : undefined,
      {
        logisticsRequired: body.logisticsRequired,
        logisticsCost: body.logisticsCost,
        logisticsPayer: body.logisticsPayer,
        pickupDetails: body.pickupDetails,
        deliveryDetails: body.deliveryDetails,
      },
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
