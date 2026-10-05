import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MarketPrice } from './entities/market-price.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';

@Injectable()
export class MarketPricesService {
  constructor(
    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,

    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
  ) {}

  async getLatestPrices(cropId?: string) {
    if (cropId) {
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

      return this.marketPriceRepository.find({
        where: {
          cropId,
        },
        order: {
          priceDate: 'DESC',
        },
      });
    }

    return this.marketPriceRepository.find({
      order: {
        priceDate: 'DESC',
      },
    });
  }
}
