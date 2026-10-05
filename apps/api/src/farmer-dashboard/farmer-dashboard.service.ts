import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { PriceFloorService } from '../price-floor/price-floor.service.js';
import { Farmer } from '../farmers/entities/farmer.entity.js';

@Injectable()
export class FarmerDashboardService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    private readonly priceFloorService: PriceFloorService,

    @InjectRepository(Farmer)
    private readonly farmerRepository: Repository<Farmer>,
  ) {}

  async getDashboard(userId: string) {
    const farmer = await this.farmerRepository.findOne({
      where: { userId },
    });

    if (!farmer) {
      return {
        farmerId: userId,
        today: {
          fairPrice: null,
          fairPriceRange: null,
          marketReference: null,
          priceFloor: null,
        },
        produce: {
          activeListings: [],
          totalListings: 0,
        },
        selling: {
          activeOffers: [],
          activeAuctions: [],
          bestBuyer: null,
          bestMarket: null,
        },
        decision: {
          recommendation: null,
          expectedPrice: null,
          confidence: null,
        },
        alerts: [],
        explanation: 'Farmer profile not found for this user.',
        disclaimer:
          'AI recommendations are not guaranteed outcomes. Actual prices and transaction results may differ.',
      };
    }

    const listings = await this.listingRepository.find({
      where: {
        farmerId: farmer.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const activeListings = listings.filter(
      (listing) => String(listing.status) === 'PUBLISHED',
    );

    const listingsWithPriceFloor = listings.map((listing) => {
      const result = this.priceFloorService.calculatePriceFloor({
        productionCostPerUnit: listing.productionCostPerUnit ?? 0,
        transportCostPerUnit: listing.transportCostPerUnit ?? 0,
        storageCostPerUnit: listing.storageCostPerUnit ?? 0,
        packagingCostPerUnit: listing.packagingCostPerUnit ?? 0,
        otherCostPerUnit: listing.otherCostPerUnit ?? 0,
        desiredMinReturnPerUnit:
          listing.desiredMinReturnPerUnit ?? 0,
      });

      return {
        listingId: listing.id,
        crop: listing.crop,
        quantity: listing.quantity,
        unit: listing.unit,
        status: listing.status,
        priceFloor: result.priceFloor,
        totalCost: result.totalCost,
      };
    });

    return {
      farmerId: userId,

      today: {
        fairPrice: null,
        fairPriceRange: null,
        marketReference: null,
        priceFloor:
          listingsWithPriceFloor.length > 0
            ? listingsWithPriceFloor[0].priceFloor
            : null,
      },

      produce: {
        activeListings: listingsWithPriceFloor.filter(
          (listing) => String(listing.status) === 'PUBLISHED',
        ),
        listings: listingsWithPriceFloor,
        totalListings: listings.length,
      },

      selling: {
        activeOffers: [],
        activeAuctions: [],
        bestBuyer: null,
        bestMarket: null,
      },

      decision: {
        recommendation: null,
        expectedPrice: null,
        confidence: null,
      },

      alerts: [],

      explanation:
        'Dashboard uses the existing PikMoolya Price Floor calculation for the farmer listings.',

      disclaimer:
        'AI recommendations are not guaranteed outcomes. Actual prices and transaction results may differ.',
    };
  }
}
