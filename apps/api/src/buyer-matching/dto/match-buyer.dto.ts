import { IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class MatchBuyerDto {
  @IsUUID()
  cropId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;
}
