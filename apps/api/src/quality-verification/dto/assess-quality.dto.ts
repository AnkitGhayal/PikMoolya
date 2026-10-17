import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AssessQualityDto {
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;

  @IsOptional()
  @IsString()
  imageType?: string;

  @IsOptional()
  @IsString()
  cropName?: string;

  @IsOptional()
  @IsString()
  variety?: string;

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

  @IsOptional()
  @IsString()
  captureSessionId?: string;

  @IsOptional()
  @IsString()
  captureMethod?: 'CAMERA' | 'GALLERY';

  @IsOptional()
  @IsString()
  capturedAt?: string;

  @IsOptional()
  @IsString()
  exifCaptureDate?: string;
}
