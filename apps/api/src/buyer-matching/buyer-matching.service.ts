import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from '../crops/entities/crop.entity.js';
import { User } from '../users/entities/user.entity.js';
import { MatchBuyerDto } from './dto/match-buyer.dto.js';

@Injectable()
export class BuyerMatchingService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async matchBuyers(dto: MatchBuyerDto) {
    const crop = await this.cropRepository.findOne({
      where: {
        id: dto.cropId,
        isActive: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Active crop not found');
    }

    const buyers = await this.userRepository.find({
      where: {
        role: 'BUYER' as any,
        status: 'ACTIVE' as any,
      },
    });

    const qualityScore = Number(dto.qualityScore ?? 80);
    const distanceKm = Number(dto.distanceKm ?? 0);

    const matches = buyers.map((buyer) => {
      const reliabilityScore = 70;

      const qualityMatch = Math.min(
        100,
        Math.max(0, qualityScore),
      );

      const distanceScore =
        distanceKm <= 25
          ? 100
          : distanceKm <= 50
            ? 80
            : distanceKm <= 100
              ? 60
              : 40;

      const matchScore =
        reliabilityScore * 0.4 +
        qualityMatch * 0.35 +
        distanceScore * 0.25;

      return {
        buyerId: buyer.id,
        buyerName: buyer.phone ?? 'Buyer',
        phone: buyer.phone,
        matchScore: Number(matchScore.toFixed(2)),
        scoreBreakdown: {
          buyerReliability: reliabilityScore,
          qualityMatch,
          distanceScore,
        },
        trustScore: reliabilityScore,
        recommendation:
          matchScore >= 80
            ? 'STRONG_MATCH'
            : matchScore >= 60
              ? 'GOOD_MATCH'
              : 'LOWER_MATCH',
      };
    });

    matches.sort(
      (a, b) => b.matchScore - a.matchScore,
    );

    return {
      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
      },
      quantity: dto.quantity,
      buyers: matches,
      dataType: 'DEMO_BUYER_MATCHING',
      disclaimer:
        'AI recommendation, not a guaranteed outcome. Verify final terms before accepting an offer.',
    };
  }
}

