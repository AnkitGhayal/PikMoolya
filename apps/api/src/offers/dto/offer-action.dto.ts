import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class OfferActionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  counterPricePerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  logisticsRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  logisticsCost?: number;

  @IsOptional()
  @IsString()
  logisticsPayer?: string;

  @IsOptional()
  @IsString()
  pickupDetails?: string;

  @IsOptional()
  @IsString()
  deliveryDetails?: string;
}