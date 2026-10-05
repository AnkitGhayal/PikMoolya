import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { FindBestMarketDto } from './dto/find-best-market.dto.js';

@Injectable()
export class MarketOptimizerService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,
  ) {}

  async findBestMarket(dto: FindBestMarketDto) {
    const crop = await this.cropRepository.findOne({
      where: {
        id: dto.cropId,
        isActive: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Active crop not found');
    }

    const marketPrices = await this.marketPriceRepository.find({
      where: {
        cropId: dto.cropId,
      },
      order: {
        priceDate: 'DESC',
      },
    });

    if (marketPrices.length === 0) {
      return {
        crop: {
          id: crop.id,
          name: crop.name,
          variety: crop.variety,
        },
        markets: [],
        recommendation: 'NO_MARKET_DATA',
        disclaimer:
          'AI recommendation, not a guaranteed outcome. No market price data is currently available.',
      };
    }

    const transportCost = Number(dto.transportCostPerUnit);
    const otherCost = Number(dto.otherCostPerUnit);

    const markets = marketPrices.map((market) => {
      const modalPrice = Number(market.modalPrice ?? 0);

      const effectiveNetPrice =
        modalPrice - transportCost - otherCost;

      const totalNetValue =
        effectiveNetPrice * Number(dto.quantity);

      return {
        market: market.marketName,
        district: market.district,
        state: market.state,
        priceDate: market.priceDate,

        modalPrice,

        costs: {
          transportPerUnit: transportCost,
          otherPerUnit: otherCost,
          totalCostPerUnit: transportCost + otherCost,
        },

        effectiveNetPrice: Number(
          effectiveNetPrice.toFixed(2),
        ),

        totalNetValue: Number(
          totalNetValue.toFixed(2),
        ),
      };
    });

    markets.sort(
      (a, b) =>
        b.effectiveNetPrice - a.effectiveNetPrice,
    );

    const bestMarket = markets[0];

    return {
      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
      },

      quantity: dto.quantity,
      unit: crop.unit,

      bestMarket: {
        market: bestMarket.market,
        district: bestMarket.district,
        state: bestMarket.state,
        effectiveNetPrice: bestMarket.effectiveNetPrice,
        totalNetValue: bestMarket.totalNetValue,
      },

      markets,

      methodology: {
        formula:
          'Effective Net Price = Market Price - Transport Cost - Other Selling Costs',
        reason:
          'The market with the highest sticker price is not always the market that gives the farmer the highest net value.',
      },

      recommendation: 'BEST_NET_VALUE_MARKET',

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Actual prices, transport costs, demand and transaction conditions may change.',
    };
  }
}
