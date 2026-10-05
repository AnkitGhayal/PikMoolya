import { IsOptional, IsString, IsUUID } from 'class-validator';

export class MarketPriceQueryDto {
  @IsOptional()
  @IsUUID()
  cropId?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsString()
  variety?: string;
}
