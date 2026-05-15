import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export enum InventoryAdjustmentType {
  PURCHASE = 'PURCHASE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

export class AdjustInventoryDto {
  @IsString()
  productId!: string;

  @IsEnum(InventoryAdjustmentType)
  type!: InventoryAdjustmentType;

  @IsInt()
  quantity!: number;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}