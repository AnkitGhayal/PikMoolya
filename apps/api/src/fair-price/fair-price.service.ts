import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { PricePrediction } from '../price-predictions/entities/price-prediction.entity.js';

import { CalculateFairPriceDto } from './dto/calculate-fair-price.dto.js';

@Injectable()
export class FairPriceService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,

    @InjectRepository(PricePrediction)
    private readonly predictionRepository: Repository<PricePrediction>,
  ) {}

  async calculateFairPrice(dto: CalculateFairPriceDto) {
    const crop = await this.cropRepository.findOne({
      where: {
        id: dto.cropId,
        isActive: true,
      },
    });

    if (!crop) {
      throw new NotFoundException(
        'Crop not found or inactive',
      );
    }

    const marketPrice = await this.marketPriceRepository.findOne({
      where: {
        cropId: dto.cropId,
      },
      order: {
        priceDate: 'DESC',
      },
    });

    if (!marketPrice) {
      throw new NotFoundException(
        'No market price data is available for this crop yet',
      );
    }

    const prediction = await this.predictionRepository.findOne({
      where: {
        cropId: dto.cropId,
      },
      order: {
        predictionDate: 'DESC',
      },
    });

    const marketReference =
      Number(marketPrice.modalPrice ?? 0);

    const predictedPrice =
      Number(prediction?.predictedPrice ?? marketReference);

    const lowerBound =
      Number(
        prediction?.lowerBound ??
          marketPrice.minPrice ??
          marketReference,
      );

    const upperBound =
      Number(
        prediction?.upperBound ??
          marketPrice.maxPrice ??
          marketReference,
      );

    const fairPrice = Math.round(
      (marketReference + predictedPrice) / 2,
    );

    const qualityAdjustment =
      dto.qualityScore !== undefined
        ? (dto.qualityScore - 80) * 0.005
        : 0;

    const adjustedFairPrice = Math.round(
      fairPrice * (1 + qualityAdjustment),
    );

    const confidence = prediction?.confidence
      ? Number(prediction.confidence)
      : null;

    return {
      certificateType: 'AI_FAIR_PRICE_CERTIFICATE',

      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
        unit: crop.unit,
      },

      fairPrice: adjustedFairPrice,

      fairRange: {
        lower: Math.round(lowerBound),
        upper: Math.round(upperBound),
      },

      marketReference: {
        modalPrice: marketReference,
        marketName: marketPrice.marketName,
        district: marketPrice.district,
        state: marketPrice.state,
        date: marketPrice.priceDate,
      },

      prediction: prediction
        ? {
            predictedPrice,
            lowerBound,
            upperBound,
            confidence,
            type: 'MODEL_RESULT',
          }
        : {
            type: 'NOT_AVAILABLE',
          },

      quality: dto.qualityScore !== undefined
        ? {
            score: dto.qualityScore,
            applied: true,
          }
        : {
            applied: false,
          },

      explanation: [
        `Latest market modal price is ?${marketReference} per ${crop.unit}.`,
        prediction
          ? `The available model result is ?${predictedPrice} per ${crop.unit}.`
          : 'No AI prediction is currently available, so the market reference is used.',
        dto.qualityScore !== undefined
          ? `A quality score of ${dto.qualityScore}/100 was considered in the estimate.`
          : 'No quality score was supplied, so no quality adjustment was applied.',
      ],

      confidenceExplanation: confidence !== null
        ? `Model confidence reported by the prediction service is ${confidence}.`
        : 'Confidence is not available because a trained prediction result is not available.',

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Actual transaction prices may differ based on market conditions, buyer demand, quality, quantity, timing and logistics.',

      dataType: prediction
        ? 'MARKET_DATA_PLUS_MODEL_RESULT'
        : 'MARKET_DATA_REFERENCE',
    };
  }
}
