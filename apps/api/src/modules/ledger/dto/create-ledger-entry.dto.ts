import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum LedgerEntryTypeDto {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class CreateLedgerEntryDto {
  @IsString()
  customerId!: string;

  @IsEnum(LedgerEntryTypeDto)
  type!: LedgerEntryTypeDto;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}