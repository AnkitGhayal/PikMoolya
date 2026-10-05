import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { SellDecisionDto } from './dto/sell-decision.dto.js';

@Injectable()
export class SellDecisionService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,
  ) {}

  async calculate(dto: SellDecisionDto) {
    const crop = await this.cropRepository.findOne({
      where: {
        id: dto.cropId,
        isActive: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Active crop not found');
    }

    const latestMarketPrice = await this.marketPriceRepository.findOne({
      where: {
        cropId: dto.cropId,
      },
      order: {
        priceDate: 'DESC',
      },
    });

    const marketReference =
      Number(latestMarketPrice?.modalPrice ?? dto.currentPrice);

    const currentPrice = Number(dto.currentPrice);
    const waitDays = Number(dto.waitDays ?? 7);

    /*
     * Demo decision model.
     *
     * These are scenario estimates, not guaranteed predictions.
     * The real XGBoost model will replace these assumptions later.
     */
    const dailyChange = 0.005;

    const pessimistic =
      currentPrice * Math.max(0.95, 1 - dailyChange * waitDays);

    const expected =
      currentPrice * (1 + dailyChange * waitDays);

    const optimistic =
      currentPrice * (1 + dailyChange * waitDays * 2);

    const scenarios = [
      {
        scenario: 'PESSIMISTIC',
        estimatedPrice: Number(pessimistic.toFixed(2)),
        changeFromCurrent: Number(
          (pessimistic - currentPrice).toFixed(2),
        ),
      },
      {
        scenario: 'EXPECTED',
        estimatedPrice: Number(expected.toFixed(2)),
        changeFromCurrent: Number(
          (expected - currentPrice).toFixed(2),
        ),
      },
      {
        scenario: 'OPTIMISTIC',
        estimatedPrice: Number(optimistic.toFixed(2)),
        changeFromCurrent: Number(
          (optimistic - currentPrice).toFixed(2),
        ),
      },
    ];

    const expectedGain =
      (expected - currentPrice) * Number(dto.quantity);

    return {
      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
      },

      quantity: dto.quantity,
      unit: crop.unit,

      currentDecision: {
        currentPrice,
        totalValue: Number(
          (currentPrice * Number(dto.quantity)).toFixed(2),
        ),
      },

      marketReference,

      waitPeriod: {
        days: waitDays,
      },

      scenarios,

      recommendation:
        expected > currentPrice
          ? 'WAIT_MAY_BE_WORTH_CONSIDERING'
          : 'SELL_NOW_MAY_BE_WORTH_CONSIDERING',

      expectedDifferencePerUnit: Number(
        (expected - currentPrice).toFixed(2),
      ),

      expectedDifferenceTotal: Number(
        expectedGain.toFixed(2),
      ),

      confidence: {
        level: 'LOW',
        reason:
          'Demo scenario model. Historical ML model confidence is not available yet.',
      },

      dataType: 'DEMO_SCENARIO_ESTIMATE',

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Future prices can move differently because of supply, demand, weather, arrivals, quality, logistics and other market conditions.',
    };
  }
}
