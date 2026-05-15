import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { LedgerService } from './ledger.service';

import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';

@Controller('ledger')
@UseGuards(AuthGuard('jwt'))
export class LedgerController {
  constructor(
    private readonly ledgerService: LedgerService,
  ) {}

  @Post()
  createEntry(
    @Request() req: any,

    @Body() dto: CreateLedgerEntryDto,
  ) {
    return this.ledgerService.createEntry(
      req.user.tenantId,
      dto,
    );
  }
@Get()
findAll(
  @Request() req: any,
) {
  return this.ledgerService.findAll(
    req.user.tenantId,
  );
}
  @Get(':customerId')
  getCustomerLedger(
    @Request() req: any,

    @Param('customerId')
    customerId: string,
  ) {
    return this.ledgerService.getCustomerLedger(
      req.user.tenantId,
      customerId,
    );
  }
}