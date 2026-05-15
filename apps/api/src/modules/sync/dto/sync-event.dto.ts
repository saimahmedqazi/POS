import {
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SyncEventDto {
  @IsString()
  eventId!: string;

  @IsString()
  eventType!: string;

  @IsObject()
  payload!: any;

  @IsOptional()
  @IsString()
  deviceId?: string;
}