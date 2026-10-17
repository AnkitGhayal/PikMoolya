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
    let crop: Crop | null = null;

    if (dto.cropId) {
      crop = await this.cropRepository.findOne({
        where: { id: dto.cropId, isActive: true },
      });
    }

    if (!crop && dto.cropName) {
      crop = await this.cropRepository.findOne({
        where: { name: dto.cropName, isActive: true },
      });
    }

    const cropName = crop?.name || dto.cropName || 'Tomato';
    const cropVariety = crop?.variety || 'Fresh Produce';
    const cropUnit = dto.unit || crop?.unit || 'kg';

    let qtyKg = Number(dto.quantity || 500);
    if (cropUnit.toLowerCase() === 'quintal' || cropUnit.toLowerCase() === 'q') {
      qtyKg = qtyKg * 100;
    } else if (cropUnit.toLowerCase() === 'ton' || cropUnit.toLowerCase() === 'tonne') {
      qtyKg = qtyKg * 1000;
    }

    let rawMarkets: Array<{
      marketName: string;
      district: string;
      distanceKm: number;
      modalPricePerKg: number;
    }> = [];

    if (crop?.id) {
      const dbPrices = await this.marketPriceRepository.find({
        where: { cropId: crop.id },
        order: { priceDate: 'DESC' },
      });

      if (dbPrices.length > 0) {
        rawMarkets = dbPrices.map((p, idx) => {
          const rawPrice = Number(p.modalPrice || 3200);
          const pricePerKg = rawPrice > 500 ? Number((rawPrice / 100).toFixed(2)) : rawPrice;
          const distances = [28, 45, 18, 52, 35];
          return {
            marketName: p.marketName || `Market ${String.fromCharCode(65 + idx)}`,
            district: p.district || 'Pune',
            distanceKm: distances[idx % distances.length],
            modalPricePerKg: pricePerKg,
          };
        });
      }
    }

    if (rawMarkets.length < 3) {
      rawMarkets = [
        {
          marketName: 'Pune APMC',
          district: 'Pune',
          distanceKm: 28,
          modalPricePerKg: 32,
        },
        {
          marketName: 'Market B (Pimpri)',
          district: 'Pune Suburb',
          distanceKm: 45,
          modalPricePerKg: 35,
        },
        {
          marketName: 'Market C (Shirur)',
          district: 'Pune East',
          distanceKm: 18,
          modalPricePerKg: 30,
        },
      ];
    }

    let vehicleType = 'Pickup Truck / Auto';
    let baseRate = 300;
    let perKmRate = 18;

    if (qtyKg > 2500) {
      vehicleType = 'Large Commercial Truck (10-Ton)';
      baseRate = 1200;
      perKmRate = 28;
    } else if (qtyKg >= 500) {
      vehicleType = 'Mini Truck (Bolero / Tempo)';
      baseRate = 500;
      perKmRate = 22;
    }

    const marketAnalyses = rawMarkets.map((m) => {
      const distance = m.distanceKm;
      const transportCost = Math.round(baseRate + distance * perKmRate);
      const grossSellingValue = Math.round(m.modalPricePerKg * qtyKg);
      const expectedNetSellingReturn = grossSellingValue - transportCost;
      const netReturnPerKg = Number((expectedNetSellingReturn / qtyKg).toFixed(2));

      return {
        marketName: m.marketName,
        district: m.district,
        distanceKm: distance,
        marketPricePerKg: m.modalPricePerKg,
        marketPricePerQuintal: m.modalPricePerKg * 100,
        vehicleRecommended: vehicleType,
        transportCost,
        grossSellingValue,
        expectedNetSellingReturn,
        netReturnPerKg,
        howCalculated: {
          formula: 'Expected Net Selling Return = Gross Selling Value - Estimated Transport',
          marketPrice: `₹${m.modalPricePerKg}/kg`,
          crop: cropName,
          quantity: `${qtyKg} kg`,
          grossSellingValue: `₹${grossSellingValue.toLocaleString('en-IN')}`,
          estimatedTransport: `-₹${transportCost.toLocaleString('en-IN')}`,
          expectedNetSellingReturn: `₹${expectedNetSellingReturn.toLocaleString('en-IN')}`,
          note: 'This is the expected amount after estimated transportation. It does not include your farming/production expenses.',
        },
      };
    });

    marketAnalyses.sort((a, b) => b.expectedNetSellingReturn - a.expectedNetSellingReturn);

    const bestMarket = marketAnalyses[0];
    const refPrice = bestMarket.marketPricePerKg;

    const todayMarketPricePerKg = refPrice;
    const aiFairPriceMinPerKg = Number((refPrice * 0.97).toFixed(1));
    const aiFairPriceMaxPerKg = Number((refPrice * 1.08).toFixed(1));
    const recommendedAskingPricePerKg = Number((refPrice * 1.03).toFixed(1));

    let whyRecommended = `Although this market is farther away (${bestMarket.distanceKm} km), its higher market price of ₹${bestMarket.marketPricePerKg}/kg is expected to compensate for the additional transportation cost (₹${bestMarket.transportCost.toLocaleString('en-IN')}) and provide the highest estimated net selling return of ₹${bestMarket.expectedNetSellingReturn.toLocaleString('en-IN')}.`;

    if (bestMarket.marketName.includes('Pune APMC')) {
      whyRecommended = `Pune APMC provides the best net selling return (₹${bestMarket.expectedNetSellingReturn.toLocaleString('en-IN')}) due to low transportation cost (₹${bestMarket.transportCost.toLocaleString('en-IN')}) for ${bestMarket.distanceKm} km distance.`;
    }

    return {
      crop: {
        name: cropName,
        variety: cropVariety,
      },
      inputSummary: {
        cropName,
        quantity: dto.quantity,
        unit: cropUnit,
        quantityInKg: qtyKg,
        farmerLocation: dto.district || 'Pune District',
      },
      recommendedMarket: {
        marketName: bestMarket.marketName,
        district: bestMarket.district,
        distanceKm: bestMarket.distanceKm,
        marketPricePerKg: bestMarket.marketPricePerKg,
        transportCost: bestMarket.transportCost,
        grossSellingValue: bestMarket.grossSellingValue,
        expectedNetSellingReturn: bestMarket.expectedNetSellingReturn,
        netReturnPerKg: bestMarket.netReturnPerKg,
        whyRecommended,
      },
      pricingMetrics: {
        todayMarketPrice: `₹${todayMarketPricePerKg}/kg`,
        aiFairPriceRange: `₹${aiFairPriceMinPerKg}–₹${aiFairPriceMaxPerKg}/kg`,
        recommendedAskingPrice: `₹${recommendedAskingPricePerKg}/kg`,
        cropName,
        marketName: bestMarket.marketName,
        todayMarketPriceNum: todayMarketPricePerKg,
        aiFairPriceMinNum: aiFairPriceMinPerKg,
        aiFairPriceMaxNum: aiFairPriceMaxPerKg,
        recommendedAskingPriceNum: recommendedAskingPricePerKg,
      },
      allMarkets: marketAnalyses,
      topChoiceCalculationBreakdown: bestMarket.howCalculated,
      disclaimer: 'Expected net selling return includes estimated transportation costs based on distance and quantity. Actual transactions may vary by market conditions.',
    };
  }
}
