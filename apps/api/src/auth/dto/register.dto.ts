import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Phone number must be a valid international phone number',
  })
  phone?: string;

  @ValidateIf((object) => !object.phone)
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsIn(['FARMER', 'BUYER', 'ADMIN', 'LOGISTICS_PARTNER'])
  role!: 'FARMER' | 'BUYER' | 'ADMIN' | 'LOGISTICS_PARTNER';

  @IsOptional()
  @IsString()
  @Length(2, 10)
  preferredLanguage?: string;
}