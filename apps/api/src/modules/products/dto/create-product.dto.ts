import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  salePrice!: number;

  @IsNumber()
  costPrice!: number;
}