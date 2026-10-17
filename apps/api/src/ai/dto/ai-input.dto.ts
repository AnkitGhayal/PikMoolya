import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PricePredictionInputDto {
  @ApiProperty({ example: 'Wheat' })
  @IsString()
  cropName!: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ example: 'Pune district', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 2400, required: false })
  @IsOptional()
  @IsNumber()
  historicalPrice?: number;

  @ApiProperty({ example: 'HIGH_DEMAND', required: false })
  @IsOptional()
  @IsString()
  marketCondition?: string;
}

export class QualityAssessmentInputDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiProperty({ example: 'Wheat', required: false })
  @IsOptional()
  @IsString()
  cropName?: string;
}
