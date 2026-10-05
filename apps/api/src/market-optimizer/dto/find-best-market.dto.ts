import { IsNumber, IsUUID, Min } from 'class-validator';

export class FindBestMarketDto {
  @IsUUID()
  cropId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  transportCostPerUnit: number;

  @IsNumber()
  @Min(0)
  otherCostPerUnit: number;
}
