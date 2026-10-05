import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { BestMarketDto } from './dto/best-market.dto.js';

@Injectable()
export class MarketOptimizerService {
  constructor(
    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
  ) {}

  async findBestMarket(dto: BestMarketDto) {
    const crop = await this.cropRepository.findOne({
      where: { id: dto.cropId, isActive: true },
    });

    if (!crop) throw new NotFoundException('Active crop not found.');

    const rows = await this.marketPriceRepository
      .createQueryBuilder('price')
      .where('price.cropId = :cropId', { cropId: dto.cropId })
      .andWhere('LOWER(price.state) = LOWER(:state)', { state: 'Maharashtra' })
      .andWhere('price.modalPrice IS NOT NULL')
      .orderBy('price.priceDate', 'DESC')
      .addOrderBy('price.modalPrice', 'DESC')
      .getMany();

    const transport = Number(dto.transportCostPerUnit ?? 0);
    const other = Number(dto.otherCostPerUnit ?? 0);

    const markets = rows.map((row) => {
      const modal = Number(row.modalPrice ?? 0);
      return {
        marketName: row.marketName,
        district: row.district,
        state: row.state,
        variety: row.variety,
        grade: row.grade,
        minPrice: row.minPrice,
        maxPrice: row.maxPrice,
        modalPrice: row.modalPrice,
        effectiveNetPrice: modal - transport - other,
        priceDate: row.priceDate,
        dataSource: row.dataSource,
      };
    });

    const bestMarket = markets.reduce<any | null>(
      (best, current) =>
        !best || current.effectiveNetPrice > best.effectiveNetPrice
          ? current
          : best,
      null,
    );

    return {
      crop: { id: crop.id, name: crop.name, variety: crop.variety },
      state: 'Maharashtra',
      quantity: dto.quantity,
      costInputs: {
        transportCostPerUnit: transport,
        otherCostPerUnit: other,
      },
      bestMarket,
      markets,
      dataSource: 'AGMARKNET',
      methodology:
        'Effective net = Maharashtra mandi modal price - transport cost per unit - other entered cost per unit.',
      disclaimer:
        'Reported wholesale market observations are not guaranteed farmer selling prices. Check the price date, variety, grade, buyer demand and logistics before selling.',
    };
  }
}
