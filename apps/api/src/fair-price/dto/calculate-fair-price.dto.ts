import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CalculateFairPriceDto {
  @IsUUID()
  cropId: string;

  @IsOptional()
  @IsUUID()
  marketId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  qualityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;
}
