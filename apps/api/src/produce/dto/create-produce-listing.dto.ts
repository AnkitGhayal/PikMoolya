import {
  IsDateString,
  IsNumber,
  IsObject,
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
  quantity!: number; // Quantity to sell

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  totalAvailableQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  minBuyerQuantity?: number;

  @IsOptional()
  @IsNumber()
  numberOfBags?: number;

  @IsOptional()
  @IsNumber()
  avgBagWeight?: number;

  @IsOptional()
  @IsNumber()
  measuredQuantity?: number;

  @IsOptional()
  @IsString()
  measurementMethod?: string;

  @IsOptional()
  @IsString()
  measurementTimestamp?: string;

  @IsOptional()
  @IsString()
  measurementSource?: string;

  @IsOptional()
  @IsObject()
  deviceInfo?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAcceptablePrice?: number;

  @IsOptional()
  @IsString()
  negotiationPreference?: string;

  @IsOptional()
  @IsString()
  deliveryPreference?: string;

  @IsOptional()
  @IsString()
  listingVisibility?: string;

  @IsOptional()
  @IsString()
  qualityDescription?: string;

  @IsOptional()
  @IsString()
  visibleCondition?: string;

  @IsOptional()
  @IsString()
  storageInfo?: string;

  @IsOptional()
  @IsString()
  locationApproximate?: string;

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
