import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from './entities/order.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,

    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,
  ) {}

  async createFromAcceptedOffer(
    userId: string,
    acceptedOfferId: string,
  ) {
    const offer = await this.offerRepository.findOne({
      where: { id: acceptedOfferId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== 'ACCEPTED') {
      throw new BadRequestException(
        'Only an accepted offer can be converted into an order',
      );
    }

    const listing = await this.listingRepository.findOne({
      where: { id: offer.listingId },
    });

    if (!listing) {
      throw new NotFoundException('Produce listing not found');
    }

    if (listing.farmerId !== userId && offer.buyerId !== userId) {
      throw new BadRequestException(
        'You are not authorized to create this order',
      );
    }

    const existingOrder = await this.orderRepository.findOne({
      where: { acceptedOfferId: offer.id },
    });

    if (existingOrder) {
      return {
        message: 'Order already exists for this accepted offer',
        order: existingOrder,
      };
    }

    const quantity = Number(listing.quantity);
    const agreedPricePerUnit = Number(offer.offeredPricePerUnit);

    const expectedGross = quantity * agreedPricePerUnit;

    const deductionsPerUnit =
      Number(offer.transportCostPerUnit ?? 0) +
      Number(offer.platformFeePerUnit ?? 0) +
      Number(offer.estimatedRiskCostPerUnit ?? 0);

    const expectedNet =
      quantity * (agreedPricePerUnit - deductionsPerUnit);

    const order = this.orderRepository.create({
      listingId: listing.id,
      farmerId: listing.farmerId,
      buyerId: offer.buyerId,
      acceptedOfferId: offer.id,
      quantity,
      agreedPricePerUnit,
      expectedGross,
      expectedNet,
      status: OrderStatus.PENDING,
    });

    const saved = await this.orderRepository.save(order);

    return {
      message: 'Order created successfully',
      order: saved,
      calculation: {
        quantity,
        agreedPricePerUnit,
        expectedGross,
        deductionsPerUnit,
        expectedNet,
      },
      explanation: [
        'Order was created from an accepted buyer offer.',
        'Expected gross = quantity × agreed price per unit.',
        'Expected net subtracts available per-unit transport, platform and risk costs.',
      ],
      disclaimer:
        'Expected net is an estimate. Actual transaction costs and final payment may differ.',
    };
  }

  async getMyOrders(userId: string) {
    return this.orderRepository.find({
      where: [
        { farmerId: userId },
        { buyerId: userId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.farmerId !== userId && order.buyerId !== userId) {
      throw new BadRequestException(
        'You are not authorized to view this order',
      );
    }

    return order;
  }

  async updateStatus(
    userId: string,
    orderId: string,
    nextStatus: OrderStatus,
  ) {
    const order = await this.getOrder(userId, orderId);

    if (!Object.values(OrderStatus).includes(nextStatus)) {
      throw new BadRequestException('Invalid order status');
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.CONFIRMED,
      ],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.PICKUP_SCHEDULED,
      ],
      [OrderStatus.PICKUP_SCHEDULED]: [
        OrderStatus.IN_TRANSIT,
      ],
      [OrderStatus.IN_TRANSIT]: [
        OrderStatus.DELIVERED,
      ],
      [OrderStatus.DELIVERED]: [],
    };

    const allowedNextStatuses = allowedTransitions[order.status] ?? [];

    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${order.status} ? ${nextStatus}`,
      );
    }

    order.status = nextStatus;

    const saved = await this.orderRepository.save(order);

    return {
      message: `Order status changed to ${nextStatus}`,
      order: saved,
      transition: {
        from: order.status,
        to: nextStatus,
      },
    };
  }
}

