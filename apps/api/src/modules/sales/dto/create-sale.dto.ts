import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

import {
  CreateSaleItemDto,
} from './create-sale-item.dto';

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

  @ValidateNested({
    each: true,
  })

  @Type(
    () => CreateSaleItemDto,
  )

  items!: CreateSaleItemDto[];

  @Type(() => Number)

  @IsNumber()

  @Min(0)

  discount!: number;

  @IsEnum(
    SalePaymentStatus,
  )

  paymentStatus!: SalePaymentStatus;
}