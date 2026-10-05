import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QualityChainCheckDto {
  @IsUUID()
  listingId: string;

  @IsIn([
    'LISTING',
    'PURCHASE',
    'PICKUP',
    'DELIVERY',
  ])
  stage: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
