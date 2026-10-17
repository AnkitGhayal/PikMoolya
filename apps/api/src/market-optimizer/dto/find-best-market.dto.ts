import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FindBestMarketDto {
  @IsOptional()
  @IsString()
  cropId?: string;

  @IsOptional()
  @IsString()
  cropName?: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  productionCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packagingCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  qualityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCostPerUnit?: number;
}
