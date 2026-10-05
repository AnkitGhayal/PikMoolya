import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class PlaceBidDto {
  @IsUUID()
  auctionId: string;

  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedRiskCostPerUnit?: number;
}
