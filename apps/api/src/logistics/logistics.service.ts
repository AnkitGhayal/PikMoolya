import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LogisticsRequest,
  LogisticsStatus,
} from './entities/logistics-request.entity.js';
import { Order, OrderStatus } from '../orders/entities/order.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(LogisticsRequest)
    private readonly logisticsRepository: Repository<LogisticsRequest>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly notificationsService: NotificationsService,
  ) {}

  async createForOrder(
    order: Order,
    cropName: string,
    unit: string,
    options?: { pickupLocation?: string; deliveryLocation?: string; estimatedCost?: number },
  ) {
    const existing = await this.logisticsRepository.findOne({
      where: { orderId: order.id },
    });

    if (existing) {
      return existing;
    }

    let farmerUserId = order.farmerId;
    let buyerUserId = order.buyerId;

    try {
      const farmer = await this.orderRepository.manager.query(
        'SELECT user_id FROM farmers WHERE id = $1 LIMIT 1',
        [order.farmerId],
      );
      if (farmer && farmer.length > 0 && farmer[0].user_id) {
        farmerUserId = farmer[0].user_id;
      }

      const buyer = await this.orderRepository.manager.query(
        'SELECT user_id FROM buyers WHERE id = $1 LIMIT 1',
        [order.buyerId],
      );
      if (buyer && buyer.length > 0 && buyer[0].user_id) {
        buyerUserId = buyer[0].user_id;
      }
    } catch {
      // Keep original
    }

    const request = this.logisticsRepository.create({
      orderId: order.id,
      farmerId: farmerUserId,
      buyerId: buyerUserId,
      pickupLocation: options?.pickupLocation || order.pickupDetails || 'Farmer Farm / Collection Hub, Pune District',
      deliveryLocation: options?.deliveryLocation || order.deliveryDetails || 'Buyer Commercial Warehouse / APMC Market',
      cropName: cropName || 'Agricultural Produce',
      quantity: Number(order.quantity),
      unit: unit || 'kg',
      distanceKm: 45,
      vehicleType: Number(order.quantity) > 1000 ? 'Heavy Commercial Truck (10T)' : 'Medium Pickup (2.5T)',
      estimatedCost: options?.estimatedCost ? Number(options.estimatedCost) : Math.round(Number(order.quantity) * 1.5 + 800),
      status: LogisticsStatus.REQUESTED,
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next-day pickup
    });

    const saved = await this.logisticsRepository.save(request);

    // Notify logistics partners & admin
    await this.notificationsService.createNotification({
      userId: 'ALL',
      role: 'LOGISTICS_PARTNER',
      title: 'New Delivery Request',
      body: `Delivery request created for ${saved.quantity} ${saved.unit} of ${saved.cropName}. Cost: ₹${saved.estimatedCost}.`,
      type: 'LOGISTICS_REQUEST',
      referenceId: saved.id,
    });

    return saved;
  }

  async getRequests(userId: string, role: string) {
    if (role === 'LOGISTICS_PARTNER' || role === 'ADMIN') {
      return this.logisticsRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    // Farmer or Buyer
    return this.logisticsRepository.find({
      where: [{ farmerId: userId }, { buyerId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptRequest(logisticsPartnerId: string, requestId: string) {
    const req = await this.logisticsRepository.findOne({
      where: { id: requestId },
    });

    if (!req) {
      throw new NotFoundException('Delivery request not found');
    }

    if (req.status !== LogisticsStatus.REQUESTED) {
      throw new BadRequestException('Delivery request is already assigned or processed');
    }

    req.status = LogisticsStatus.ACCEPTED;
    req.logisticsPartnerId = logisticsPartnerId;
    const saved = await this.logisticsRepository.save(req);

    // Update corresponding order
    const order = await this.orderRepository.findOne({ where: { id: req.orderId } });
    if (order) {
      order.status = OrderStatus.CONFIRMED;
      await this.orderRepository.save(order);
    }

    // Notify Farmer & Buyer
    await this.notificationsService.createNotification({
      userId: req.farmerId,
      role: 'FARMER',
      title: 'Logistics Partner Confirmed',
      body: `A logistics partner has accepted the delivery request for your ${req.cropName} order (#${req.orderId.slice(0, 8)}).`,
      type: 'LOGISTICS_ACCEPTED',
      referenceId: req.id,
    });

    await this.notificationsService.createNotification({
      userId: req.buyerId,
      role: 'BUYER',
      title: 'Delivery Partner Assigned',
      body: `A logistics partner has accepted transportation for your ${req.cropName} order (#${req.orderId.slice(0, 8)}).`,
      type: 'LOGISTICS_ACCEPTED',
      referenceId: req.id,
    });

    return {
      message: '✓ Delivery request accepted successfully. Farmer and buyer have been notified.',
      request: saved,
    };
  }

  async rejectRequest(logisticsPartnerId: string, requestId: string) {
    const req = await this.logisticsRepository.findOne({
      where: { id: requestId },
    });

    if (!req) {
      throw new NotFoundException('Delivery request not found');
    }

    req.status = LogisticsStatus.REJECTED;
    const saved = await this.logisticsRepository.save(req);

    return {
      message: 'Delivery request rejected.',
      request: saved,
    };
  }

  async updateStatus(
    logisticsPartnerId: string,
    requestId: string,
    nextStatus: LogisticsStatus,
  ) {
    const req = await this.logisticsRepository.findOne({
      where: { id: requestId },
    });

    if (!req) {
      throw new NotFoundException('Delivery request not found');
    }

    req.status = nextStatus;
    const saved = await this.logisticsRepository.save(req);

    // Synchronize Order status
    const order = await this.orderRepository.findOne({ where: { id: req.orderId } });
    if (order) {
      if (nextStatus === LogisticsStatus.PICKUP_SCHEDULED) {
        order.status = OrderStatus.PICKUP_SCHEDULED;
      } else if (nextStatus === LogisticsStatus.PICKED_UP) {
        order.status = OrderStatus.PICKED_UP as any;
      } else if (nextStatus === LogisticsStatus.IN_TRANSIT) {
        order.status = OrderStatus.IN_TRANSIT;
      } else if (nextStatus === LogisticsStatus.DELIVERED || nextStatus === LogisticsStatus.COMPLETED) {
        order.status = OrderStatus.DELIVERED;
      }
      await this.orderRepository.save(order);
    }

    // Send status notifications
    const statusTitles: Record<string, string> = {
      [LogisticsStatus.PICKUP_SCHEDULED]: 'Pickup Scheduled',
      [LogisticsStatus.PICKED_UP]: 'Product Picked Up',
      [LogisticsStatus.IN_TRANSIT]: 'Order In Transit',
      [LogisticsStatus.DELIVERED]: 'Order Delivered',
      [LogisticsStatus.COMPLETED]: 'Order Completed',
    };

    const title = statusTitles[nextStatus] || `Status Updated: ${nextStatus}`;

    await this.notificationsService.createNotification({
      userId: req.farmerId,
      role: 'FARMER',
      title: `✓ ${title}`,
      body: `Logistics status updated to ${nextStatus} for ${req.cropName}.`,
      type: nextStatus,
      referenceId: req.id,
    });

    await this.notificationsService.createNotification({
      userId: req.buyerId,
      role: 'BUYER',
      title: `✓ ${title}`,
      body: `Logistics status updated to ${nextStatus} for ${req.cropName}.`,
      type: nextStatus,
      referenceId: req.id,
    });

    return {
      message: `✓ Status updated to ${nextStatus}. Farmer and buyer notified.`,
      request: saved,
    };
  }
}
