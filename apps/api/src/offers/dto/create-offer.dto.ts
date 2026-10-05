import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @IsUUID()
  listingId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offeredPricePerUnit: number;

  @IsOptional()
  @IsUUID()
  auctionId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  transportCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  platformFeePerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estimatedRiskCostPerUnit?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
