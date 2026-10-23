import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Order, OrderStatus } from './entities/order.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { ProduceListing, ProduceListingStatus } from '../produce/entities/produce-listing.entity.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,

    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    private readonly dataSource: DataSource,
  ) {}

  async createFromAcceptedOffer(
    userId: string,
    acceptedOfferId: string,
    options?: {
      logisticsRequired?: boolean;
      logisticsCost?: number;
      logisticsPayer?: string;
      pickupDetails?: string;
      deliveryDetails?: string;
    },
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

    const [buyerRow, farmerRow] = await Promise.all([
      this.dataSource.query('SELECT id FROM buyers WHERE user_id = $1 LIMIT 1', [userId]),
      this.dataSource.query('SELECT id FROM farmers WHERE user_id = $1 LIMIT 1', [userId]),
    ]);
    const bId = buyerRow?.[0]?.id;
    const fId = farmerRow?.[0]?.id;

    const isFarmer = listing.farmerId === userId || (fId && listing.farmerId === fId);
    const isBuyer = offer.buyerId === userId || (bId && offer.buyerId === bId);

    if (!isFarmer && !isBuyer) {
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

    const orderQty = offer.quantity ? Number(offer.quantity) : Number(listing.quantity);
    const availableForSale = Number(listing.remainingQuantity ?? listing.quantity);

    if (orderQty > availableForSale) {
      throw new ConflictException(
        `Insufficient available quantity. Requested ${orderQty} ${listing.unit}, but only ${availableForSale} ${listing.unit} is available.`,
      );
    }

    const agreedPricePerUnit = Number(offer.offeredPricePerUnit);
    const expectedGross = orderQty * agreedPricePerUnit;

    const deductionsPerUnit =
      Number(offer.transportCostPerUnit ?? 0) +
      Number(offer.platformFeePerUnit ?? 0) +
      Number(offer.estimatedRiskCostPerUnit ?? 0);

    const expectedNet =
      orderQty * (agreedPricePerUnit - deductionsPerUnit);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newSoldQty = Number(listing.soldQuantity || 0) + orderQty;
      const newRemainingQty = availableForSale - orderQty;

      listing.soldQuantity = newSoldQty;
      listing.remainingQuantity = newRemainingQty;

      if (newRemainingQty <= 0) {
        listing.status = ProduceListingStatus.SOLD;
      } else {
        listing.status = ProduceListingStatus.PUBLISHED;
      }

      await queryRunner.manager.save(listing);

      const isLogisticsRequired = Boolean(options?.logisticsRequired);
      const logisticsCost = isLogisticsRequired ? Number(options?.logisticsCost ?? 1200) : 0;
      const logisticsStatus = isLogisticsRequired ? 'REQUESTED' : 'NO_LOGISTICS';

      const order = this.orderRepository.create({
        listingId: listing.id,
        farmerId: listing.farmerId,
        buyerId: offer.buyerId,
        acceptedOfferId: offer.id,
        quantity: orderQty,
        agreedPricePerUnit,
        expectedGross,
        expectedNet,
        status: isLogisticsRequired ? OrderStatus.LOGISTICS_REQUESTED : OrderStatus.CONFIRMED,
        logisticsRequired: isLogisticsRequired,
        logisticsCost,
        logisticsPayer: options?.logisticsPayer || 'BUYER',
        logisticsStatus,
        pickupDetails: options?.pickupDetails || null,
        deliveryDetails: options?.deliveryDetails || null,
      });

      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return {
        message: 'Order created successfully with partial quantity transaction support',
        order: savedOrder,
        inventoryUpdate: {
          previousAvailable: availableForSale,
          purchasedQuantity: orderQty,
          remainingQuantity: newRemainingQty,
          soldQuantity: newSoldQty,
          listingStatus: listing.status,
        },
        calculation: {
          quantity: orderQty,
          agreedPricePerUnit,
          expectedGross,
          deductionsPerUnit,
          expectedNet,
        },
        explanation: [
          'Order created from accepted offer.',
          'Listing inventory automatically updated to prevent overselling.',
        ],
        disclaimer:
          'Expected net is an estimate. Final payment is processed at delivery.',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createDirectOrder(
    userId: string,
    productId: string,
    quantity: number,
    price?: number,
    options?: {
      logisticsRequired?: boolean;
      logisticsCost?: number;
      logisticsPayer?: string;
      pickupDetails?: string;
      deliveryDetails?: string;
    },
  ) {
    const listing = await this.listingRepository.findOne({
      where: { id: productId },
    });

    if (!listing) {
      throw new NotFoundException('Produce listing not found');
    }

    const availableForSale = Number(listing.remainingQuantity ?? listing.quantity);
    if (quantity > availableForSale) {
      throw new ConflictException(
        `Insufficient available quantity. Requested ${quantity} ${listing.unit}, but only ${availableForSale} ${listing.unit} is available.`,
      );
    }

    const agreedPricePerUnit = price || Number(listing.expectedPrice || 2500);
    const expectedGross = quantity * agreedPricePerUnit;
    const expectedNet = expectedGross;

    let buyerId = userId;
    const buyerRows = await this.dataSource.query(
      'SELECT id FROM buyers WHERE user_id = $1',
      [userId],
    );
    if (buyerRows && buyerRows.length > 0) {
      buyerId = buyerRows[0].id;
    } else {
      const newBuyer = await this.dataSource.query(
        'INSERT INTO buyers (user_id, business_name, buyer_type) VALUES ($1, $2, $3) RETURNING id',
        [userId, 'Trading Partner', 'TRADER'],
      );
      buyerId = newBuyer[0].id;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newSoldQty = Number(listing.soldQuantity || 0) + quantity;
      const newRemainingQty = availableForSale - quantity;

      listing.soldQuantity = newSoldQty;
      listing.remainingQuantity = newRemainingQty;

      if (newRemainingQty <= 0) {
        listing.status = ProduceListingStatus.SOLD;
      } else {
        listing.status = ProduceListingStatus.PUBLISHED;
      }

      await queryRunner.manager.save(listing);

      const isLogisticsRequired = Boolean(options?.logisticsRequired);
      const logisticsCost = isLogisticsRequired ? Number(options?.logisticsCost ?? 1200) : 0;
      const logisticsStatus = isLogisticsRequired ? 'REQUESTED' : 'NO_LOGISTICS';

      const order = this.orderRepository.create({
        listingId: listing.id,
        farmerId: listing.farmerId,
        buyerId: buyerId,
        acceptedOfferId: null,
        quantity,
        agreedPricePerUnit,
        expectedGross,
        expectedNet,
        status: isLogisticsRequired ? OrderStatus.LOGISTICS_REQUESTED : OrderStatus.CONFIRMED,
        logisticsRequired: isLogisticsRequired,
        logisticsCost,
        logisticsPayer: options?.logisticsPayer || 'BUYER',
        logisticsStatus,
        pickupDetails: options?.pickupDetails || null,
        deliveryDetails: options?.deliveryDetails || null,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return {
        message: 'Order created successfully with inventory deduction',
        order: savedOrder,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyOrders(userId: string) {
    const farmerRows = await this.dataSource.query(
      'SELECT id FROM farmers WHERE user_id = $1',
      [userId],
    );
    const buyerRows = await this.dataSource.query(
      'SELECT id FROM buyers WHERE user_id = $1',
      [userId],
    );
    const farmerId = farmerRows?.[0]?.id;
    const buyerId = buyerRows?.[0]?.id;

    const conditions: any[] = [];
    if (farmerId) conditions.push({ farmerId });
    if (buyerId) conditions.push({ buyerId });
    conditions.push({ farmerId: userId }, { buyerId: userId });

    const orders = await this.orderRepository.find({
      where: conditions,
      order: { createdAt: 'DESC' },
    });

    const listingIds = [...new Set(orders.map((o) => o.listingId).filter(Boolean))];
    const listingMap: Record<string, string> = {};
    if (listingIds.length > 0) {
      const listings = await this.listingRepository.find({
        where: listingIds.map((id) => ({ id })),
        relations: { crop: true },
      });
      for (const l of listings) {
        listingMap[l.id] = l.crop?.name || 'Agricultural Produce';
      }
    }

    return orders.map((o) => ({
      ...o,
      cropName: listingMap[o.listingId] || 'Agricultural Produce',
    }));
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const farmerRows = await this.dataSource.query(
      'SELECT id FROM farmers WHERE user_id = $1',
      [userId],
    );
    const buyerRows = await this.dataSource.query(
      'SELECT id FROM buyers WHERE user_id = $1',
      [userId],
    );
    const farmerId = farmerRows?.[0]?.id;
    const buyerId = buyerRows?.[0]?.id;

    const isAuthorized =
      order.farmerId === userId ||
      order.buyerId === userId ||
      (farmerId && order.farmerId === farmerId) ||
      (buyerId && order.buyerId === buyerId);

    if (!isAuthorized) {
      throw new BadRequestException(
        'You are not authorized to view this order',
      );
    }

    let listing: ProduceListing | null = null;
    if (order.listingId) {
      listing = await this.listingRepository.findOne({
        where: { id: order.listingId },
        relations: { crop: true },
      });
    }

    return {
      ...order,
      listing,
    };
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
      [OrderStatus.PENDING]: [OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.LOGISTICS_REQUESTED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.LOGISTICS_REQUESTED, OrderStatus.LOGISTICS_ASSIGNED, OrderStatus.PICKUP_SCHEDULED, OrderStatus.CANCELLED],
      [OrderStatus.LOGISTICS_REQUESTED]: [OrderStatus.LOGISTICS_ASSIGNED, OrderStatus.PICKUP_SCHEDULED, OrderStatus.CANCELLED],
      [OrderStatus.LOGISTICS_ASSIGNED]: [OrderStatus.PICKUP_SCHEDULED, OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKUP_SCHEDULED]: [OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowedNextStatuses = allowedTransitions[order.status] ?? [];

    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition`,
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
