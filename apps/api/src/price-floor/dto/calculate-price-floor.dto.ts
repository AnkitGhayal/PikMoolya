import {
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CalculatePriceFloorDto {
  @IsNumber()
  @Min(0)
  productionCostPerUnit!: number;

  @IsNumber()
  @Min(0)
  transportCostPerUnit!: number;

  @IsNumber()
  @Min(0)
  storageCostPerUnit!: number;

  @IsNumber()
  @Min(0)
  packagingCostPerUnit!: number;

  @IsNumber()
  @Min(0)
  otherCostPerUnit!: number;

  @IsNumber()
  @Min(0)
  desiredMinReturnPerUnit!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  platformFeePerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedSpoilagePerUnit?: number;
}
