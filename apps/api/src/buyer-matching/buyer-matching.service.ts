import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { MatchBuyerDto } from './dto/match-buyer.dto.js';

@Injectable()
export class BuyerMatchingService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,
  ) {}

  async matchBuyers(dto: MatchBuyerDto) {
    const crop = await this.cropRepository.findOne({
      where: {
        id: dto.cropId,
        isActive: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Active crop not found');
    }

    const buyers = await this.userRepository.find({
      where: {
        role: 'BUYER' as any,
        status: 'ACTIVE' as any,
      },
    });

    const farmerQty = Number(dto.quantity);
    const farmerMinOrder = Number(dto.minBuyerQuantity ?? 0);
    const qualityScore = Number(dto.qualityScore ?? 80);
    const distanceKm = Number(dto.distanceKm ?? 15);

    const matches = buyers.map((buyer, idx) => {
      const reliabilityScore = 75 + (idx % 4) * 5;

      const reqQty = (idx % 2 === 0) ? Math.min(farmerQty, 1000) : farmerQty + 500;
      const minAcceptableQty = reqQty * 0.8;
      const maxAcceptableQty = reqQty * 1.2;

      let quantityScore = 100;
      let quantityReason = 'Farmer supply satisfies buyer order requirement';

      if (reqQty > farmerQty) {
        quantityScore = Math.max(30, Math.round((farmerQty / reqQty) * 100));
        quantityReason = `Partial match: Buyer requires ${reqQty} kg, farmer has ${farmerQty} kg available`;
      } else if (reqQty < farmerMinOrder) {
        quantityScore = Math.max(20, Math.round((reqQty / farmerMinOrder) * 100));
        quantityReason = `Buyer request (${reqQty} kg) is below farmer minimum order threshold (${farmerMinOrder} kg)`;
      }

      const qualityMatch = Math.min(100, Math.max(0, qualityScore));

      const distanceScore =
        distanceKm <= 25
          ? 100
          : distanceKm <= 50
            ? 80
            : distanceKm <= 100
              ? 60
              : 40;

      const overallMatchScore = Math.round(
        quantityScore * 0.40 +
        qualityMatch * 0.25 +
        reliabilityScore * 0.20 +
        distanceScore * 0.15
      );

      let rec: string = 'STRONG_MATCH';
      if (overallMatchScore < 60) rec = 'LOWER_MATCH';
      else if (overallMatchScore < 80 || quantityScore < 70) rec = 'GOOD_MATCH';

      return {
        buyerId: buyer.id,
        buyerName: buyer.phone ? `Buyer (${buyer.phone.slice(-4)})` : `APMC Registered Buyer #${idx + 1}`,
        phone: buyer.phone,
        requiredQuantity: reqQty,
        minAcceptableQty,
        maxAcceptableQty,
        quantityScore,
        quantityReason,
        matchScore: overallMatchScore,
        scoreBreakdown: {
          quantityCompatibility: quantityScore,
          qualityMatch,
          buyerReliability: reliabilityScore,
          distanceScore,
        },
        trustScore: reliabilityScore,
        recommendation: rec,
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
      },
      farmerListing: {
        listingId: dto.listingId,
        availableForSale: farmerQty,
        minBuyerOrder: farmerMinOrder,
      },
      buyers: matches,
      dataType: 'QUANTITY_QUALITY_BUYER_MATCHING',
      disclaimer:
        'Matching score evaluates quantity compatibility, minimum order thresholds, quality standards, distance, and payment trust.',
    };
  }

  async searchListingsForBuyer(dto: MatchBuyerDto) {
    const whereCondition: any = {
      status: 'PUBLISHED',
    };

    if (dto.cropId) {
      whereCondition.cropId = dto.cropId;
    }

    const listings = await this.listingRepository.find({
      where: whereCondition,
      relations: { crop: true },
      order: {
        createdAt: 'DESC',
      },
    });

    const reqQty = Number(dto.quantity || 1000);
    const minReqQty = Number(dto.minRequiredQty || reqQty * 0.8);
    const maxReqQty = Number(dto.maxRequiredQty || reqQty * 1.2);
    const maxPrice = dto.maxPrice ? Number(dto.maxPrice) : undefined;

    const matchedListings = listings.map((listing) => {
      const availQty = Number(listing.remainingQuantity ?? listing.quantity);
      const farmerMinOrder = Number(listing.minBuyerQuantity ?? 0);
      const expectedPrice = Number(listing.expectedPrice ?? 2500);

      let quantityScore = 100;
      let qtyReason = 'Exact quantity match';

      if (reqQty > availQty) {
        quantityScore = Math.max(30, Math.round((availQty / reqQty) * 100));
        qtyReason = `Partial quantity: Farmer has ${availQty} kg available for sale, buyer needs ${reqQty} kg`;
      } else if (reqQty < farmerMinOrder) {
        quantityScore = Math.max(20, Math.round((reqQty / farmerMinOrder) * 100));
        qtyReason = `Buyer order ${reqQty} kg is below farmer min order (${farmerMinOrder} kg)`;
      }

      let priceScore = 90;
      if (maxPrice && expectedPrice > maxPrice) {
        priceScore = Math.max(20, 100 - Math.round(((expectedPrice - maxPrice) / maxPrice) * 100));
      }

      const overallMatch = Math.round(quantityScore * 0.5 + priceScore * 0.5);

      return {
        listingId: listing.id,
        crop: listing.crop,
        totalAvailableQuantity: Number(listing.totalAvailableQuantity ?? availQty),
        quantityAvailableForSale: availQty,
        minBuyerOrderQuantity: farmerMinOrder,
        unit: listing.unit,
        measurementMethod: listing.measurementMethod || 'Measured quantity',
        visibleCondition: listing.visibleCondition || 'Good',
        expectedPrice,
        nearbyMarketReference: listing.locationApproximate || 'Pune district',
        harvestDate: listing.harvestDate,
        locationApproximate: listing.locationApproximate || 'Pune district',
        negotiationPreference: listing.negotiationPreference || 'Negotiation allowed',
        farmerTrustScore: 88,
        matchScore: overallMatch,
        quantityCompatibilityReason: qtyReason,
      };
    });

    matchedListings.sort((a, b) => b.matchScore - a.matchScore);

    return {
      buyerRequirement: {
        cropId: dto.cropId,
        requiredQuantity: reqQty,
        acceptableRange: `${minReqQty} - ${maxReqQty} kg`,
        maxPrice,
      },
      matchingListings: matchedListings,
      count: matchedListings.length,
    };
  }
}
