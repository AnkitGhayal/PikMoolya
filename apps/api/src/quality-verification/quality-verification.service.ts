import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { AssessQualityDto } from './dto/assess-quality.dto.js';

@Injectable()
export class QualityVerificationService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,
  ) {}

  async assessQuality(
    userId: string,
    dto: AssessQualityDto,
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

    const scores = {
      size: Number(dto.sizeScore ?? 80),
      color: Number(dto.colorScore ?? 80),
      damage: Number(dto.damageScore ?? 80),
      defects: Number(dto.defectScore ?? 80),
      uniformity: Number(dto.uniformityScore ?? 80),
      appearance: Number(dto.appearanceScore ?? 80),
    };

    /*
     * Temporary scoring engine.
     * A computer-vision model will replace these inputs later.
     *
     * Higher damage/defect scores currently mean
     * better condition (less visible damage/defects).
     */

    const overallScore =
      scores.size * 0.15 +
      scores.color * 0.15 +
      scores.damage * 0.20 +
      scores.defects * 0.20 +
      scores.uniformity * 0.15 +
      scores.appearance * 0.15;

    const roundedScore = Number(
      overallScore.toFixed(2),
    );

    let grade: 'A' | 'B' | 'C';

    if (roundedScore >= 85) {
      grade = 'A';
    } else if (roundedScore >= 70) {
      grade = 'B';
    } else {
      grade = 'C';
    }

    return {
      listingId: listing.id,

      crop: listing.crop,

      quality: {
        score: roundedScore,
        grade,

        dimensions: {
          size: scores.size,
          color: scores.color,
          damage: scores.damage,
          defects: scores.defects,
          uniformity: scores.uniformity,
          appearance: scores.appearance,
        },
      },

      assessment: {
        type: 'AI_ASSISTED_QUALITY_ASSESSMENT',
        modelStatus: 'DEMO_SCORING_ENGINE',
        notes: dto.notes ?? null,
      },

      explanation: [
        'Quality score combines size, color, visible damage, visible defects, uniformity and appearance.',
        'Higher scores indicate better visible quality.',
        'The assessment is intended as decision support for buyers and farmers.',
      ],

      limitations: [
        'Image-based assessment cannot guarantee laboratory quality.',
        'Hidden internal defects may not be visible.',
        'Lighting, camera quality and image angle can affect results.',
      ],

      disclaimer:
        'AI-assisted quality assessment, not a laboratory certification or guarantee. Final quality should be verified according to the agreed transaction terms.',
    };
  }
}
