import { Injectable } from '@nestjs/common';
import { AnalyzeRiskDto } from './dto/analyze-risk.dto.js';

@Injectable()
export class RiskAnalysisService {
  analyze(dto: AnalyzeRiskDto) {
    const transportCost = Number(dto.transportCostPerUnit ?? 0);
    const reliability = Number(dto.buyerReliabilityScore ?? 70);
    const quality = Number(dto.qualityScore ?? 80);
    const distance = Number(dto.distanceKm ?? 0);

    let riskScore = 0;

    if (reliability < 50) {
      riskScore += 40;
    } else if (reliability < 70) {
      riskScore += 20;
    } else if (reliability < 85) {
      riskScore += 10;
    }

    if (distance > 300) {
      riskScore += 20;
    } else if (distance > 100) {
      riskScore += 10;
    }

    if (quality < 60) {
      riskScore += 15;
    }

    riskScore = Math.min(100, riskScore);

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';

    if (riskScore >= 50) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 25) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    const estimatedRiskCostPerUnit =
      Number((dto.offerPricePerUnit * (riskScore / 100) * 0.05).toFixed(2));

    const effectiveNetPerUnit = Number(
      (
        dto.offerPricePerUnit -
        transportCost -
        estimatedRiskCostPerUnit
      ).toFixed(2),
    );

    return {
      offerPricePerUnit: dto.offerPricePerUnit,
      transportCostPerUnit: transportCost,
      estimatedRiskCostPerUnit,
      effectiveNetPerUnit,

      risk: {
        score: riskScore,
        level: riskLevel,
        buyerReliabilityScore: reliability,
        distanceKm: distance,
        qualityScore: quality,
      },

      explanation:
        'Risk-adjusted net value considers buyer reliability, distance, quality and transport cost.',

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Risk estimates are indicative and actual transaction outcomes may differ.',
    };
  }
}
