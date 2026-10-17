import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { LogisticsRequest } from '../logistics/entities/logistics-request.entity.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(LogisticsRequest)
    private readonly logisticsRepository: Repository<LogisticsRequest>,
  ) {}

  async getPlatformStats() {
    const totalFarmers = await this.userRepository.count({
      where: { role: UserRole.FARMER },
    });

    const totalBuyers = await this.userRepository.count({
      where: { role: UserRole.BUYER },
    });

    const totalLogistics = await this.userRepository.count({
      where: { role: UserRole.LOGISTICS_PARTNER },
    });

    const activeProducts = await this.listingRepository.count({
      where: { status: 'PUBLISHED' as any },
    });

    const pendingOffers = await this.offerRepository.count({
      where: { status: 'PENDING' as any },
    });

    const activeOrders = await this.orderRepository.count();

    const activeDeliveries = await this.logisticsRepository.count({
      where: { status: 'IN_TRANSIT' as any },
    });

    return {
      totalFarmers,
      totalBuyers,
      totalLogistics,
      activeProducts,
      pendingOffers,
      activeOrders,
      activeDeliveries,
      platformHealth: 'OPERATIONAL',
      updatedAt: new Date(),
    };
  }

  async getAllUsers() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getAllOrders() {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getAllOffers() {
    return this.offerRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getAllLogistics() {
    return this.logisticsRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
