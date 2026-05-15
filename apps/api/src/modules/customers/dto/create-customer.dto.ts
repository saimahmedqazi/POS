import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum CustomerTypeDto {
  WALK_IN = 'WALK_IN',
  VENDOR = 'VENDOR',
}

export class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(CustomerTypeDto)
  type!: CustomerTypeDto;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;
}