import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Farmer } from '../farmers/entities/farmer.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { PriceFloorService } from '../price-floor/price-floor.service.js';
import { FairPriceService } from '../fair-price/fair-price.service.js';

import {
  ProduceListing,
  ProduceListingStatus,
} from './entities/produce-listing.entity.js';

import { CreateProduceListingDto } from './dto/create-produce-listing.dto.js';
import { UpdateProduceListingDto } from './dto/update-produce-listing.dto.js';

@Injectable()
export class ProduceService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly produceRepository: Repository<ProduceListing>,

    @InjectRepository(Farmer)
    private readonly farmerRepository: Repository<Farmer>,

    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    private readonly priceFloorService: PriceFloorService,
    private readonly fairPriceService: FairPriceService,
  ) {}

  private async getFarmerByUserId(userId: string) {
    const farmer = await this.farmerRepository.findOne({
      where: { userId },
    });

    if (!farmer) {
      throw new NotFoundException(
        'Farmer profile not found. Please create your farmer profile first.',
      );
    }

    return farmer;
  }

  private async getFarmerListing(
    userId: string,
    listingId: string,
  ) {
    const farmer = await this.getFarmerByUserId(userId);

    const listing = await this.produceRepository.findOne({
      where: {
        id: listingId,
        farmerId: farmer.id,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        'Produce listing not found',
      );
    }

    return listing;
  }

  private async validateCrop(cropId: string) {
    const crop = await this.cropRepository.findOne({
      where: {
        id: cropId,
        isActive: true,
      },
    });

    if (!crop) {
      throw new NotFoundException(
        'Crop not found or inactive',
      );
    }

    return crop;
  }

  async createListing(
    userId: string,
    dto: CreateProduceListingDto,
  ) {
    const farmer = await this.getFarmerByUserId(userId);

    await this.validateCrop(dto.cropId);

    const listing = this.produceRepository.create({
      farmerId: farmer.id,
      cropId: dto.cropId,
      farmId: dto.farmId ?? null,
      quantity: dto.quantity,
      unit: dto.unit ?? 'quintal',
      harvestDate: dto.harvestDate ?? null,
      locationName: dto.locationName ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      productionCostPerUnit:
        dto.productionCostPerUnit ?? null,
      transportCostPerUnit:
        dto.transportCostPerUnit ?? null,
      storageCostPerUnit:
        dto.storageCostPerUnit ?? null,
      packagingCostPerUnit:
        dto.packagingCostPerUnit ?? null,
      otherCostPerUnit:
        dto.otherCostPerUnit ?? null,
      desiredMinReturnPerUnit:
        dto.desiredMinReturnPerUnit ?? null,
      status: ProduceListingStatus.DRAFT,
      publishedAt: null,
    });

    const savedListing =
      await this.produceRepository.save(listing);

    return {
      message: 'Produce listing created successfully',
      listing: savedListing,
    };
  }

  async getMyListings(userId: string) {
    const farmer = await this.getFarmerByUserId(userId);

    return this.produceRepository.find({
      where: {
        farmerId: farmer.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getListing(
    userId: string,
    listingId: string,
  ) {
    return this.getFarmerListing(
      userId,
      listingId,
    );
  }

  async updateListing(
    userId: string,
    listingId: string,
    updateDto: UpdateProduceListingDto,
  ) {
    const listing = await this.getFarmerListing(
      userId,
      listingId,
    );

    if (listing.status !== ProduceListingStatus.DRAFT) {
      throw new ConflictException(
        'Only draft listings can be updated',
      );
    }

    if (updateDto.cropId) {
      await this.validateCrop(updateDto.cropId);
    }

    Object.assign(listing, updateDto);

    const updatedListing =
      await this.produceRepository.save(listing);

    return {
      message: 'Produce listing updated successfully',
      listing: updatedListing,
    };
  }

  async publishListing(
    userId: string,
    listingId: string,
  ) {
    const listing = await this.getFarmerListing(
      userId,
      listingId,
    );

    if (listing.status !== ProduceListingStatus.DRAFT) {
      throw new ConflictException(
        'Only draft listings can be published',
      );
    }

    listing.status = ProduceListingStatus.PUBLISHED;
    listing.publishedAt = new Date();

    const publishedListing =
      await this.produceRepository.save(listing);

    return {
      message: 'Produce listing published successfully',
      listing: publishedListing,
    };
  }

  async cancelListing(
    userId: string,
    listingId: string,
  ) {
    const listing = await this.getFarmerListing(
      userId,
      listingId,
    );

    if (
      listing.status === ProduceListingStatus.SOLD ||
      listing.status === ProduceListingStatus.CANCELLED
    ) {
      throw new ConflictException(
        'This listing cannot be cancelled',
      );
    }

    listing.status = ProduceListingStatus.CANCELLED;

    const cancelledListing =
      await this.produceRepository.save(listing);

    return {
      message: 'Produce listing cancelled successfully',
      listing: cancelledListing,
    };
  }
  async calculateListingFairPrice(userId: string, listingId: string) {
    const listing = await this.getFarmerListing(userId, listingId);

    const fairPrice = await this.fairPriceService.calculateFairPrice({
      cropId: listing.cropId,
      qualityScore: undefined,
      quantity: Number(listing.quantity),
    });

    return {
      listingId: listing.id,
      crop: listing.crop,
      quantity: listing.quantity,
      unit: listing.unit,
      fairPrice,
    };
  }

  async calculateListingDecision(userId: string, listingId: string) {
    const listing = await this.getFarmerListing(userId, listingId);

    const fairPrice = await this.fairPriceService.calculateFairPrice({
      cropId: listing.cropId,
      quantity: Number(listing.quantity),
    });

    const priceFloor = this.priceFloorService.calculatePriceFloor({
      productionCostPerUnit: listing.productionCostPerUnit ?? 0,
      transportCostPerUnit: listing.transportCostPerUnit ?? 0,
      storageCostPerUnit: listing.storageCostPerUnit ?? 0,
      packagingCostPerUnit: listing.packagingCostPerUnit ?? 0,
      otherCostPerUnit: listing.otherCostPerUnit ?? 0,
      desiredMinReturnPerUnit: listing.desiredMinReturnPerUnit ?? 0,
    });

    const gapFromFloor =
      fairPrice.fairPrice - priceFloor.priceFloor;

    return {
      listingId: listing.id,
      crop: listing.crop,
      quantity: listing.quantity,
      unit: listing.unit,

      aiFairPrice: fairPrice,

      priceFloor: {
        priceFloor: priceFloor.priceFloor,
        totalCost: priceFloor.totalCost,
        breakdown: priceFloor.breakdown,
      },

      decisionSupport: {
        fairPriceAboveFloor: gapFromFloor >= 0,
        gapFromFloor,
        recommendation:
          fairPrice.fairPrice >= priceFloor.priceFloor
            ? 'FAIR_PRICE_ABOVE_FLOOR'
            : 'FLOOR_ABOVE_FAIR_PRICE',
      },

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Actual transaction prices may differ.',
    };
  }

  async calculateListingPriceFloor(
    userId: string,
    listingId: string,
  ) {
    const listing = await this.getFarmerListing(
      userId,
      listingId,
    );

    const result =
      this.priceFloorService.calculatePriceFloor({
        productionCostPerUnit:
          listing.productionCostPerUnit ?? 0,

        transportCostPerUnit:
          listing.transportCostPerUnit ?? 0,

        storageCostPerUnit:
          listing.storageCostPerUnit ?? 0,

        packagingCostPerUnit:
          listing.packagingCostPerUnit ?? 0,

        otherCostPerUnit:
          listing.otherCostPerUnit ?? 0,

        desiredMinReturnPerUnit:
          listing.desiredMinReturnPerUnit ?? 0,
      });

    return {
      listingId: listing.id,
      cropId: listing.cropId,
      quantity: listing.quantity,
      unit: listing.unit,
      priceFloor: result.priceFloor,
      totalCost: result.totalCost,
      breakdown: result.breakdown,
      explanation: result.explanation,
      disclaimer: result.disclaimer,
    };
  }
}





