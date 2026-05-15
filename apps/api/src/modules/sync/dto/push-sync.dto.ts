import {
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { SyncEventDto } from './sync-event.dto';

export class PushSyncDto {
  @IsArray()

  @ArrayMinSize(1)

  @ValidateNested({ each: true })

  @Type(() => SyncEventDto)

  events!: SyncEventDto[];
}