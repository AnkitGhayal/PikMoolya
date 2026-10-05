import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  acceptedOfferId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  agreedPricePerUnit: number;
}
