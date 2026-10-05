import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class AnalyzeRiskDto {
  @IsNumber()
  @Min(0)
  offerPricePerUnit: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  transportCostPerUnit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  buyerReliabilityScore?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  qualityScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  distanceKm?: number;
}
