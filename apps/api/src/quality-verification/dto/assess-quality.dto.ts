import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AssessQualityDto {
  @IsUUID()
  listingId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sizeScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  colorScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  damageScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defectScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uniformityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  appearanceScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
