import {
  IsInt,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateSaleItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;
}