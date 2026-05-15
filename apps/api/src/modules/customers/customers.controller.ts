import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { CustomersService } from './customers.service';

import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Post()
  create(
    @Request() req: any,

    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(
      req.user.tenantId,
      dto,
    );
  }

  @Get()
  findAll(
    @Request() req: any,
  ) {
    return this.customersService.findAll(
      req.user.tenantId,
    );
  }
}