import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateAuctionDto {
  @IsUUID()
  listingId: string;

  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPricePerUnit?: number;
}
