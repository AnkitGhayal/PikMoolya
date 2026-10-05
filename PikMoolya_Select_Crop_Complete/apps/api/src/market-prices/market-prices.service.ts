import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { MarketPrice } from './entities/market-price.entity.js';
import { MarketPriceQueryDto } from './dto/market-price-query.dto.js';

type AgmarkRecord = {
  id?: string;
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrival_date?: string;
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
};

@Injectable()
export class MarketPricesService {
  private readonly apiUrl =
    'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

  constructor(
    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
    private readonly configService: ConfigService,
  ) {}

  async getPrices(query: MarketPriceQueryDto) {
    const qb = this.marketPriceRepository
      .createQueryBuilder('price')
      .where('price.state = :state', { state: 'Maharashtra' })
      .orderBy('price.priceDate', 'DESC')
      .addOrderBy('price.modalPrice', 'DESC');

    if (query.cropId) {
      qb.andWhere('price.cropId = :cropId', { cropId: query.cropId });
    }
    if (query.district) {
      qb.andWhere('LOWER(price.district) = LOWER(:district)', {
        district: query.district,
      });
    }
    if (query.market) {
      qb.andWhere('LOWER(price.marketName) = LOWER(:market)', {
        market: query.market,
      });
    }
    if (query.variety) {
      qb.andWhere('LOWER(price.variety) = LOWER(:variety)', {
        variety: query.variety,
      });
    }

    const rows = await qb.getMany();

    return {
      source: 'AGMARKNET',
      sourceDescription:
        'Government of India daily wholesale mandi market data.',
      state: 'Maharashtra',
      count: rows.length,
      prices: rows,
      disclaimer:
        'Market prices are reported observations, not guaranteed selling prices. Always check the price date and market before making a selling decision.',
    };
  }

  async syncMaharashtra() {
    const apiKey = this.configService.get<string>('DATA_GOV_API_KEY');

    if (!apiKey) {
      throw new BadRequestException(
        'DATA_GOV_API_KEY is missing. Add your data.gov.in API key to the API .env file.',
      );
    }

    const limit = 1000;
    let offset = 0;
    let totalFetched = 0;
    let insertedOrUpdated = 0;

    while (true) {
      const url = new URL(this.apiUrl);
      url.searchParams.set('api-key', apiKey);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('filters[state.keyword]', 'Maharashtra');

      let payload: { records?: AgmarkRecord[] };
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `data.gov.in returned HTTP ${response.status}: ${await response.text()}`,
          );
        }
        payload = (await response.json()) as { records?: AgmarkRecord[] };
      } catch (error: any) {
        throw new InternalServerErrorException(
          `Unable to fetch Maharashtra mandi data: ${error?.message ?? error}`,
        );
      }

      const records = Array.isArray(payload.records) ? payload.records : [];
      totalFetched += records.length;

      if (records.length === 0) break;

      for (const record of records) {
        if (!record.commodity || !record.market || !record.arrival_date) {
          continue;
        }

        const crop = await this.findOrCreateCrop(
          record.commodity,
          record.variety,
        );

        const sourceRecordId =
          record.id ??
          [
            record.state,
            record.district,
            record.market,
            record.commodity,
            record.variety,
            record.grade,
            record.arrival_date,
          ]
            .filter(Boolean)
            .join('|');

        const existing = await this.marketPriceRepository.findOne({
          where: { sourceRecordId },
        });

        const entity =
          existing ??
          this.marketPriceRepository.create({
            cropId: crop.id,
            marketName: record.market,
            district: record.district ?? null,
            state: record.state ?? 'Maharashtra',
            variety: record.variety ?? null,
            grade: record.grade ?? null,
            priceDate: record.arrival_date,
            dataSource: 'AGMARKNET',
            sourceRecordId,
          });

        entity.cropId = crop.id;
        entity.marketName = record.market;
        entity.district = record.district ?? null;
        entity.state = record.state ?? 'Maharashtra';
        entity.variety = record.variety ?? null;
        entity.grade = record.grade ?? null;
        entity.priceDate = record.arrival_date;
        entity.minPrice = this.numericOrNull(record.min_price);
        entity.maxPrice = this.numericOrNull(record.max_price);
        entity.modalPrice = this.numericOrNull(record.modal_price);
        entity.dataSource = 'AGMARKNET';
        entity.sourceRecordId = sourceRecordId;

        await this.marketPriceRepository.save(entity);
        insertedOrUpdated++;
      }

      if (records.length < limit) break;
      offset += limit;
    }

    return {
      success: true,
      source: 'AGMARKNET',
      state: 'Maharashtra',
      fetchedRecords: totalFetched,
      savedRecords: insertedOrUpdated,
      message:
        'Maharashtra market data has been synchronized into PikMoolya.',
    };
  }

  private async findOrCreateCrop(
    commodity: string,
    variety?: string,
  ): Promise<Crop> {
    const name = commodity.trim();
    const normalizedVariety = variety?.trim() || null;

    let crop = await this.cropRepository.findOne({
      where: normalizedVariety
        ? { name, variety: normalizedVariety }
        : { name },
    });

    if (!crop) {
      crop = this.cropRepository.create({
        name,
        variety: normalizedVariety ?? undefined,
        unit: 'quintal',
        isActive: true,
      });
      crop = await this.cropRepository.save(crop);
    }

    return crop;
  }

  private numericOrNull(value: string | number | undefined) {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(n) ? n.toFixed(2) : null;
  }
}
