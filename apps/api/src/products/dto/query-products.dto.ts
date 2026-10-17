import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'Wheat' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Wheat' })
  @IsOptional()
  @IsString()
  cropName?: string;

  @ApiPropertyOptional({ example: 'Standard' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Pune' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minQualityScore?: number;

  @ApiPropertyOptional({ enum: ['price_asc', 'price_desc', 'quality', 'newest'] })
  @IsOptional()
  @IsString()
  sortBy?: 'price_asc' | 'price_desc' | 'quality' | 'newest';
}
