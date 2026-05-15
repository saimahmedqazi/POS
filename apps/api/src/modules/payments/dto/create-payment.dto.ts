import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PaymentMethodDto {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
  CREDIT = 'CREDIT',
}

export class CreatePaymentDto {
  @IsString()
  customerId!: string;

  @IsNumber()
  amount!: number;

  @IsEnum(PaymentMethodDto)
  method!: PaymentMethodDto;

  @IsOptional()
  @IsString()
  note?: string;
}