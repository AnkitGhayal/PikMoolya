import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProduceListingDto {
  @IsUUID()
  cropId!: string;

  @IsOptional()
  @IsUUID()
  farmId?: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string;

  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationName?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  productionCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  storageCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packagingCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  desiredMinReturnPerUnit?: number;
}
