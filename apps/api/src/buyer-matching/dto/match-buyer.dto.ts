import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class MatchBuyerDto {
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsUUID()
  cropId!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minBuyerQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedPrice?: number;

  @IsOptional()
  @IsString()
  qualityGrade?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  // Buyer Search parameters
  @IsOptional()
  @IsNumber()
  @Min(0)
  minRequiredQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRequiredQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
