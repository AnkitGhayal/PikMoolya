import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class AnalyzeOfferDto {
  @IsUUID()
  listingId: string;

  @IsNumber()
  @Min(0)
  offerPricePerUnit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyerTransportCostPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyerRiskCostPerUnit?: number;
}
