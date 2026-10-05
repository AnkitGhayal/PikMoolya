import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { MarketPrice } from '../market-prices/entities/market-price.entity.js';
import { FairPriceService } from '../fair-price/fair-price.service.js';
import { PriceFloorService } from '../price-floor/price-floor.service.js';
import { AnalyzeOfferDto } from './dto/analyze-offer.dto.js';

@Injectable()
export class NegotiationsService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    @InjectRepository(MarketPrice)
    private readonly marketPriceRepository: Repository<MarketPrice>,

    private readonly fairPriceService: FairPriceService,

    private readonly priceFloorService: PriceFloorService,
  ) {}

  async analyzeOffer(
    userId: string,
    dto: AnalyzeOfferDto,
  ) {
    const listing =
      await this.listingRepository.findOne({
        where: {
          id: dto.listingId,
          farmerId: userId,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Produce listing not found',
      );
    }

    const fairPrice =
      await this.fairPriceService.calculateFairPrice({
        cropId: listing.cropId,
        quantity: Number(listing.quantity),
      });

    const priceFloor =
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

    const marketPrice =
      await this.marketPriceRepository.findOne({
        where: {
          cropId: listing.cropId,
        },
        order: {
          priceDate: 'DESC',
        },
      });

    const offer = Number(dto.offerPricePerUnit);

    const transport =
      Number(dto.buyerTransportCostPerUnit ?? 0);

    const risk =
      Number(dto.buyerRiskCostPerUnit ?? 0);

    const effectiveNet =
      offer - transport - risk;

    const fair =
      Number(fairPrice.fairPrice);

    const floor =
      Number(priceFloor.priceFloor);

    const market =
      Number(marketPrice?.modalPrice ?? 0);

    const gapFromFair =
      offer - fair;

    const gapFromFloor =
      offer - floor;

    const suggestedCounter =
      Math.max(
        floor,
        fair * 0.98,
      );

    let decision:
      | 'ACCEPTABLE'
      | 'NEGOTIATE'
      | 'BELOW_PRICE_FLOOR';

    if (offer < floor) {
      decision = 'BELOW_PRICE_FLOOR';
    } else if (offer < fair) {
      decision = 'NEGOTIATE';
    } else {
      decision = 'ACCEPTABLE';
    }

    return {
      listingId: listing.id,

      crop: listing.crop,

      quantity: listing.quantity,
      unit: listing.unit,

      offer: {
        offeredPricePerUnit: offer,
        transportCostPerUnit: transport,
        estimatedRiskCostPerUnit: risk,
        effectiveNetPerUnit:
          Number(effectiveNet.toFixed(2)),
      },

      referencePrices: {
        aiFairPrice: fair,
        fairRange: fairPrice.fairRange,
        priceFloor: floor,
        marketModalPrice: market,
      },

      comparison: {
        gapFromFairPrice:
          Number(gapFromFair.toFixed(2)),

        gapFromPriceFloor:
          Number(gapFromFloor.toFixed(2)),

        effectiveNetVsFair:
          Number(
            (effectiveNet - fair).toFixed(2),
          ),
      },

      negotiation: {
        decision,

        suggestedCounterOffer:
          Number(
            suggestedCounter.toFixed(2),
          ),

        reason:
          decision === 'BELOW_PRICE_FLOOR'
            ? 'The offer is below the farmer price floor.'
            : decision === 'NEGOTIATE'
              ? 'The offer is above the price floor but below the AI fair price.'
              : 'The offer is at or above the AI fair price.',

        farmerMessage:
          decision === 'BELOW_PRICE_FLOOR'
            ? 'Your offer is below the farmer price floor. Consider negotiating for a higher price.'
            : decision === 'NEGOTIATE'
              ? 'The offer is below the AI fair price. Consider negotiating for a better price.'
              : 'The offer is at or above the AI fair price.',      },

      explanation: [
        'Fair price is an AI-assisted reference based on available market and prediction data.',
        'Price floor represents the farmer-defined minimum economic threshold.',
        'Effective net value accounts for estimated buyer-side transport and risk costs.',
        'The farmer remains in control of the final decision.',
      ],

      dataType: 'AI_ASSISTED_OFFER_ANALYSIS',

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Actual transaction prices may differ based on market conditions, quality, quantity, buyer demand and logistics.',
    };
  }
}

