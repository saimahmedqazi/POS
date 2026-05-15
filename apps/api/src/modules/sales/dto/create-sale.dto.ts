import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateSaleItemDto } from './create-sale-item.dto';

export enum SalePaymentStatus {
  PAID = 'PAID',
  CREDIT = 'CREDIT',
  PARTIAL = 'PARTIAL',
}

export class CreateSaleDto {
  @IsOptional()
@IsString()
customerId?: string;
  @IsArray()
  @ArrayMinSize(1)

  @ValidateNested({ each: true })

  @Type(() => CreateSaleItemDto)

  items!: CreateSaleItemDto[];

  @IsNumber()
  discount!: number;

  @IsEnum(SalePaymentStatus)
  paymentStatus!: SalePaymentStatus;
}