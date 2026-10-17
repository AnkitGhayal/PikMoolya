import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCertificateDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  cropName!: string;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore!: number;

  @IsString()
  qualityGrade!: string;

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsNumber()
  estimatedPrice?: number;

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  @IsObject()
  assessmentData?: Record<string, any>;

  @IsOptional()
  @IsString()
  language?: string;
}
