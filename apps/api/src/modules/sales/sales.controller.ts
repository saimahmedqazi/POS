import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { SalesService } from './sales.service';

import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
  ) {}

  @Post()
  createSale(
    @Request() req: any,

    @Body() dto: CreateSaleDto,
  ) {
    return this.salesService.createSale(
      req.user.tenantId,
      dto,
    );
  }

  @Get()
  findAll(
    @Request() req: any,
  ) {
    return this.salesService.findAll(
      req.user.tenantId,
    );
  }
}