import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProducePassportDto {
  @IsUUID()
  listingId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
