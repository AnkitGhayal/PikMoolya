import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PricePrediction } from './entities/price-prediction.entity.js';
import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';

@Injectable()
export class PricePredictionsService {
  constructor(
    @InjectRepository(PricePrediction)
    private readonly predictionRepository: Repository<PricePrediction>,

    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,
  ) {}

  async getLatestPrediction(cropId: string) {
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

    const prediction =
      await this.predictionRepository.findOne({
        where: {
          cropId,
        },
        order: {
          predictionDate: 'DESC',
        },
      });

    if (prediction) {
      return prediction;
    }

    const latestMarketPrice =
      await this.marketPriceRepository.findOne({
        where: {
          cropId,
        },
        order: {
          priceDate: 'DESC',
        },
      });

    if (!latestMarketPrice) {
      throw new NotFoundException(
        'No market price data is available for this crop',
      );
    }

    return {
      type: 'MARKET_DATA_REFERENCE',
      message:
        'AI prediction is not available yet. Latest market data is provided as a reference.',
      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
        unit: crop.unit,
      },
      market: {
        name: latestMarketPrice.marketName,
        district: latestMarketPrice.district,
        state: latestMarketPrice.state,
        date: latestMarketPrice.priceDate,
        minPrice: latestMarketPrice.minPrice,
        maxPrice: latestMarketPrice.maxPrice,
        modalPrice: latestMarketPrice.modalPrice,
      },
      disclaimer:
        'AI recommendation, not a guaranteed outcome.',
    };
  }
}
