import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class SellDecisionDto {
  @IsUUID()
  cropId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  currentPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  waitDays?: number;
}
