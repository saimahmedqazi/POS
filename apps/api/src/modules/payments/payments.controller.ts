import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PaymentsService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  recordPayment(
    @Request() req: any,

    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.recordPayment(
      req.user.tenantId,
      dto,
    );
  }

  @Get()
  findAll(
    @Request() req: any,
  ) {
    return this.paymentsService.findAll(
      req.user.tenantId,
    );
  }
}