import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing, ProduceListingStatus } from '../produce/entities/produce-listing.entity.js';
import { Farmer } from '../farmers/entities/farmer.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { AiService } from '../ai/ai.service.js';
import { QueryProductsDto } from './dto/query-products.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    @InjectRepository(Farmer)
    private readonly farmerRepository: Repository<Farmer>,

    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    private readonly aiService: AiService,
  ) {}

  async createProduct(userId: string, body: any) {
    const farmer = await this.farmerRepository.findOne({ where: { userId } });
    if (!farmer) {
      throw new NotFoundException('Farmer profile required to create products.');
    }

    let crop = await this.cropRepository.findOne({
      where: { id: body.cropId || body.cropName },
    });

    if (!crop && body.cropName) {
      crop = await this.cropRepository.findOne({
        where: { name: body.cropName },
      });
    }

    if (!crop) {
      crop = await this.cropRepository.save(
        this.cropRepository.create({
          name: body.cropName || 'Wheat',
          variety: body.category || body.variety || 'Standard',
          unit: body.unit || 'quintal',
          isActive: true,
        })
      );
    }

    const predicted = await this.aiService.predictPrice({
      cropName: crop.name,
      quantity: Number(body.quantity || 100),
      historicalPrice: Number(body.expectedPrice || 2400),
    });

    const listing = this.listingRepository.create({
      farmerId: farmer.id,
      cropId: crop.id,
      quantity: Number(body.quantity || 100),
      totalAvailableQuantity: Number(body.quantity || 100),
      remainingQuantity: Number(body.quantity || 100),
      unit: body.unit || crop.unit || 'quintal',
      expectedPrice: Number(body.expectedPrice || 2500),
      locationName: body.location || farmer.district || 'Pune district',
      locationApproximate: body.location || farmer.district || 'Pune district',
      qualityDescription: body.description || 'Fresh harvest',
      visibleCondition: 'Good',
      status: ProduceListingStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    const saved = await this.listingRepository.save(listing);

    return {
      success: true,
      message: 'Product created and listed successfully',
      data: {
        id: saved.id,
        cropName: crop.name,
        category: crop.variety,
        quantity: saved.quantity,
        unit: saved.unit,
        expectedPrice: saved.expectedPrice,
        predictedFairPrice: predicted.predictedPrice,
        qualityScore: 85,
        qualityCategory: 'Grade A',
        status: saved.status,
      },
    };
  }

  async findAllProducts(query: QueryProductsDto) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(50, Number(query.limit || 12)));
    const skip = (page - 1) * limit;

    const listings = await this.listingRepository.find({
      where: { status: ProduceListingStatus.PUBLISHED },
      relations: { crop: true },
      order: { createdAt: 'DESC' },
    });

    let filtered = listings.map((item) => {
      const expected = Number(item.expectedPrice || 2500);
      const predictedFair = Math.round(expected * 0.98);
      return {
        id: item.id,
        farmerId: item.farmerId,
        cropName: item.crop?.name || 'Crop',
        category: item.crop?.variety || 'Agricultural Produce',
        quantity: Number(item.remainingQuantity ?? item.quantity),
        unit: item.unit || 'quintal',
        location: item.locationApproximate || item.locationName || 'Pune district',
        expectedPrice: expected,
        predictedFairPrice: predictedFair,
        qualityScore: 84.5,
        qualityCategory: 'Grade A',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600',
        description: item.qualityDescription || 'Fresh agricultural produce directly from farm harvest.',
        status: item.status,
        createdAt: item.createdAt,
      };
    });

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter((p) => p.cropName.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }

    if (query.cropName) {
      filtered = filtered.filter((p) => p.cropName.toLowerCase() === query.cropName?.toLowerCase());
    }

    if (query.minPrice) {
      filtered = filtered.filter((p) => p.expectedPrice >= Number(query.minPrice));
    }

    if (query.maxPrice) {
      filtered = filtered.filter((p) => p.expectedPrice <= Number(query.maxPrice));
    }

    if (query.sortBy === 'price_asc') {
      filtered.sort((a, b) => a.expectedPrice - b.expectedPrice);
    } else if (query.sortBy === 'price_desc') {
      filtered.sort((a, b) => b.expectedPrice - a.expectedPrice);
    } else if (query.sortBy === 'quality') {
      filtered.sort((a, b) => b.qualityScore - a.qualityScore);
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: paginated,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneProduct(id: string) {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: { crop: true },
    });

    if (!listing) {
      throw new NotFoundException('Product not found');
    }

    const expected = Number(listing.expectedPrice || 2500);
    const predicted = Math.round(expected * 0.98);

    return {
      success: true,
      data: {
        id: listing.id,
        farmerId: listing.farmerId,
        cropName: listing.crop?.name || 'Crop',
        category: listing.crop?.variety || 'Agricultural Produce',
        quantity: Number(listing.remainingQuantity ?? listing.quantity),
        unit: listing.unit || 'quintal',
        location: listing.locationApproximate || listing.locationName || 'Pune district',
        expectedPrice: expected,
        predictedFairPrice: predicted,
        qualityScore: 84.5,
        qualityCategory: 'Grade A',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600',
        description: listing.qualityDescription || 'Fresh agricultural produce directly from farm harvest.',
        status: listing.status,
        createdAt: listing.createdAt,
      },
    };
  }
}
