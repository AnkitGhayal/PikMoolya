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
  @IsString()
  message?: string;
}
