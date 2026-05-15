import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { InventoryService } from './inventory.service';

import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Post('adjust')
  adjustStock(
    @Request() req: any,

    @Body() dto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjustStock(
      req.user.tenantId,
      dto,
    );
  }

  @Get()
  getInventory(
    @Request() req: any,
  ) {
    return this.inventoryService.getInventory(
      req.user.tenantId,
    );
  }

  @Get('movements')
  getMovements(
    @Request() req: any,
  ) {
    return this.inventoryService.getMovements(
      req.user.tenantId,
    );
  }
}