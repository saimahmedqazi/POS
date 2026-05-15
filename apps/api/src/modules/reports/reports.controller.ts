import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('daily-sales')
  async getDailySales(
    @Req() req: any,
  ) {
    return this.reportsService.getDailySales(
      req.user.tenantId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('inventory-valuation')
  async getInventoryValuation(
    @Req() req: any,
  ) {
    return this.reportsService.getInventoryValuation(
      req.user.tenantId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('top-products')
  async getTopProducts(
    @Req() req: any,
  ) {
    return this.reportsService.getTopProducts(
      req.user.tenantId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profit-summary')
  async getProfitSummary(
    @Req() req: any,
  ) {
    return this.reportsService.getProfitSummary(
      req.user.tenantId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('customer-balances')
  async getCustomerBalances(
    @Req() req: any,
  ) {
    return this.reportsService.getCustomerBalances(
      req.user.tenantId,
    );
  }
}