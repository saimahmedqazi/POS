import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { SyncService } from './sync.service';

import { PushSyncDto } from './dto/push-sync.dto';

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
  ) {}

  @Post('push')
  pushEvents(
    @Request() req: any,

    @Body() dto: PushSyncDto,
  ) {
    return this.syncService.pushEvents(
      req.user.tenantId,
      dto,
    );
  }

  @Get('pending')
  getPendingEvents(
    @Request() req: any,
  ) {
    return this.syncService.getPendingEvents(
      req.user.tenantId,
    );
  }
}