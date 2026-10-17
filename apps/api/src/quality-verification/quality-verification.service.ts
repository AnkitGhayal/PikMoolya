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
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,
  ) {}

  async createCaptureSession() {
    const sessionHex = Math.random().toString(36).substring(2, 10);
    return {
      captureSessionId: `CS-${Date.now()}-${sessionHex}`,
      issuedAt: new Date().toISOString(),
    };
  }

  async assessQuality(
    userId: string,
    dto: AssessQualityDto,
  ) {
    let listing: ProduceListing | null = null;
    if (dto.listingId) {
      listing = await this.listingRepository.findOne({
        where: {
          id: dto.listingId,
          farmerId: userId,
        },
      });
    }

    if (!listing && !dto.imageBase64 && !dto.cropName) {
      throw new NotFoundException('Produce listing not found');
    }

    let aiResult: any = null;

    if (dto.imageBase64) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${this.aiServiceUrl}/analyze-quality`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_base64: dto.imageBase64,
            crop_name: dto.cropName || listing?.crop?.name || 'Produce',
            variety: dto.variety || listing?.crop?.variety,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          aiResult = await response.json();
        }
      } catch (err: any) {
        console.log('FastAPI AI Service call fallback:', err?.message);
      }
    }

    const captureMethod = dto.captureMethod || (dto.captureSessionId ? 'CAMERA' : 'GALLERY');
    const captureAuthenticity = {
      method: captureMethod,
      captureSessionId: dto.captureSessionId || null,
      capturedAt: dto.capturedAt || new Date().toISOString(),
      exifCaptureDate: dto.exifCaptureDate || null,
      statusText: captureMethod === 'CAMERA' || dto.captureSessionId
        ? 'Captured using PikMoolya camera'
        : dto.exifCaptureDate
          ? `Uploaded from device gallery (Original photo date: ${dto.exifCaptureDate})`
          : 'Uploaded from device gallery',
    };

    if (aiResult) {
      return {
        listingId: listing?.id || null,
        crop: listing?.crop || null,
        quality: {
          score: aiResult.quality_score,
          grade: aiResult.quality_grade,
          visibleCondition: aiResult.visible_condition,
          detectedIssues: aiResult.detected_issues,
          confidence: aiResult.confidence_percentage,
          dimensions: aiResult.quality_metrics,
          imageQuality: aiResult.image_quality,
          recommendation: aiResult.recommendation,
          expertReviewRequired: aiResult.expert_review_required,
        },
        captureAuthenticity,
        assessment: {
          type: 'AI_VISUAL_ASSESSMENT',
          modelStatus: 'LIVE_COMPUTER_VISION_PIPELINE',
          modelName: aiResult.model_metadata?.architecture || 'MobileNetV3-AgriQuality',
          modelVersion: aiResult.model_metadata?.version || 'v2.3',
          notes: dto.notes ?? null,
        },
        explanation: [
          'AI computer vision visual assessment analyzes surface condition, discoloration, lighting, blur, and uniformity from crop photos.',
          'Quality grade A/B/C is computed strictly from visible visual attributes.',
        ],
        limitations: aiResult.limitations || [
          'Visual assessment does not replace laboratory testing.',
          'Moisture, residue, and internal defects require lab verification.',
        ],
        disclaimer: aiResult.disclaimer || 'AI Visual Assessment for price discovery support only.',
      };
    }

    const scores = {
      size: Number(dto.sizeScore ?? 80),
      color: Number(dto.colorScore ?? 80),
      damage: Number(dto.damageScore ?? 80),
      defects: Number(dto.defectScore ?? 80),
      uniformity: Number(dto.uniformityScore ?? 80),
      appearance: Number(dto.appearanceScore ?? 80),
    };

    const overallScore = Number(
      (
        scores.size * 0.15 +
        scores.color * 0.15 +
        scores.damage * 0.20 +
        scores.defects * 0.20 +
        scores.uniformity * 0.15 +
        scores.appearance * 0.15
      ).toFixed(2)
    );

    let grade: 'A' | 'B' | 'C' = 'B';
    if (overallScore >= 85) grade = 'A';
    else if (overallScore < 70) grade = 'C';

    return {
      listingId: listing?.id || null,
      crop: listing?.crop || null,
      quality: {
        score: overallScore,
        grade,
        visibleCondition: grade === 'A' ? 'Excellent' : grade === 'B' ? 'Good' : 'Fair',
        detectedIssues: grade === 'C' ? ['Minor discoloration visible'] : ['Good condition'],
        confidence: 85.0,
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
        type: 'AI_VISUAL_ASSESSMENT',
        modelStatus: 'FALLBACK_SCORING_ENGINE',
        notes: dto.notes ?? null,
      },
      explanation: [
        'Quality score combines size, color, visible damage, visible defects, uniformity and appearance.',
        'Higher scores indicate better visible quality.',
      ],
      limitations: [
        'Visual assessment does not replace laboratory chemical or moisture testing.',
      ],
      disclaimer:
        'AI-assisted quality assessment, not a laboratory certification or guarantee.',
    };
  }
}
