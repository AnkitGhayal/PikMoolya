import { Injectable } from '@nestjs/common';

import { CalculatePriceFloorDto } from './dto/calculate-price-floor.dto.js';

@Injectable()
export class PriceFloorService {
  calculatePriceFloor(dto: CalculatePriceFloorDto) {
    const productionCost = Number(dto.productionCostPerUnit ?? 0);
    const transportCost = Number(dto.transportCostPerUnit ?? 0);
    const storageCost = Number(dto.storageCostPerUnit ?? 0);
    const packagingCost = Number(dto.packagingCostPerUnit ?? 0);
    const otherCost = Number(dto.otherCostPerUnit ?? 0);
    const desiredMinimumReturn = Number(
      dto.desiredMinReturnPerUnit ?? 0,
    );
    const platformFee = Number(dto.platformFeePerUnit ?? 0);
    const expectedSpoilage = Number(
      dto.expectedSpoilagePerUnit ?? 0,
    );

    const totalCost =
      productionCost +
      transportCost +
      storageCost +
      packagingCost +
      otherCost +
      platformFee +
      expectedSpoilage;

    const priceFloor = totalCost + desiredMinimumReturn;

    return {
      priceFloor: Number(priceFloor.toFixed(2)),

      breakdown: {
        productionCost,
        transportCost,
        storageCost,
        packagingCost,
        otherCost,
        platformFee,
        expectedSpoilage,
        desiredMinimumReturn,
      },

      totalCost: Number(totalCost.toFixed(2)),

      explanation:
        'The price floor is the minimum reasonable selling price based on the provided costs, expected spoilage, and desired minimum return.',

      disclaimer:
        'AI recommendation, not a guaranteed outcome.',
    };
  }

  compareOffer(
    priceFloor: number,
    buyerOffer: number,
  ) {
    const floor = Number(priceFloor);
    const offer = Number(buyerOffer);

    const gap = floor - offer;

    if (gap <= 0) {
      return {
        status: 'ABOVE_PRICE_FLOOR',
        buyerOffer: offer,
        priceFloor: floor,
        gap: 0,
        warning: false,
        message:
          'This offer is at or above the calculated price floor.',
      };
    }

    const suggestedCounter = floor * 1.03;

    return {
      status: 'BELOW_PRICE_FLOOR',
      buyerOffer: offer,
      priceFloor: floor,
      gap: Number(gap.toFixed(2)),
      warning: true,
      suggestedCounterOffer:
        Number(suggestedCounter.toFixed(2)),
      message:
        'This offer is below the calculated price floor. The farmer makes the final decision.',
    };
  }
}
