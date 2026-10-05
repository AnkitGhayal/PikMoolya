import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { ProducePassport } from '../produce-passports/entities/produce-passport.entity.js';
import { QualityChainCheckDto } from './dto/quality-chain-check.dto.js';

@Injectable()
export class QualityChainService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    @InjectRepository(ProducePassport)
    private readonly passportRepository: Repository<ProducePassport>,
  ) {}

  async recordCheck(
    userId: string,
    dto: QualityChainCheckDto,
  ) {
    const listing = await this.listingRepository.findOne({
      where: { id: dto.listingId },
    });

    if (!listing) {
      throw new NotFoundException('Produce listing not found');
    }

    if (listing.farmerId !== userId) {
      throw new BadRequestException(
        'You are not authorized to record quality checks for this listing',
      );
    }

    const qualityScore = Number(dto.qualityScore);

    if (qualityScore < 0 || qualityScore > 100) {
      throw new BadRequestException(
        'Quality score must be between 0 and 100',
      );
    }

    const grade =
      qualityScore >= 85
        ? 'A'
        : qualityScore >= 70
          ? 'B'
          : 'C';

    const passport = await this.passportRepository.findOne({
      where: { listingId: listing.id },
    });

    if (!passport) {
      throw new NotFoundException(
        'Produce Passport not found for this listing',
      );
    }

    const history = Array.isArray(passport.passportData?.['qualityHistory'])
      ? [
          ...(passport.passportData['qualityHistory'] as Record<
            string,
            unknown
          >[]),
        ]
      : [];

    const previousCheck = history.length > 0
      ? history[history.length - 1]
      : null;

    let comparisonStatus = 'BASELINE';

    if (previousCheck) {
      const previousScore = Number(
        previousCheck['qualityScore'] ?? qualityScore,
      );

      const difference = qualityScore - previousScore;

      if (difference <= -10) {
        comparisonStatus = 'SIGNIFICANT_DECREASE';
      } else if (difference < 0) {
        comparisonStatus = 'DECREASE';
      } else if (difference >= 10) {
        comparisonStatus = 'SIGNIFICANT_INCREASE';
      } else if (difference > 0) {
        comparisonStatus = 'INCREASE';
      } else {
        comparisonStatus = 'UNCHANGED';
      }
    }

    const check = {
      stage: dto.stage,
      qualityScore,
      grade,
      notes: dto.notes ?? null,
      comparisonStatus,
      recordedAt: new Date().toISOString(),
    };

    history.push(check);

    passport.passportData = {
      ...passport.passportData,
      qualityHistory: history,
      latestQualityCheck: check,
    };

    await this.passportRepository.save(passport);

    return {
      message: 'Quality chain check recorded successfully',

      listingId: listing.id,

      stage: dto.stage,

      quality: {
        score: qualityScore,
        grade,
      },

      comparison: {
        status: comparisonStatus,
        previousScore: previousCheck
          ? Number(previousCheck['qualityScore'])
          : null,
        currentScore: qualityScore,
      },

      passport: {
        lotId: passport.lotId,
        historyCount: history.length,
      },

      explanation: [
        'The quality check has been added to the Produce Passport.',
        'Quality changes are compared with the previous recorded stage.',
        'A significant decrease is flagged for review.',
        'The system does not automatically accuse any farmer, buyer or logistics partner.',
      ],

      disclaimer:
        'AI-assisted quality assessment is not a laboratory certification. Quality scores are indicative and should be reviewed with appropriate evidence.',
    };
  }
}
