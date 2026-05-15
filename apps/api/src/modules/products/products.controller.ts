import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Request,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';

import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  create(
    @Request() req: any,

    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(
      req.user.tenantId,
      dto,
    );
  }

  @Get()
  findAll(
    @Request() req: any,
  ) {
    return this.productsService.findAll(
      req.user.tenantId,
    );
  }

  @Patch(':id')
  update(
    @Request() req: any,

    @Param('id') id: string,

    @Body()
    dto: UpdateProductDto,
  ) {
    return this.productsService.update(
      req.user.tenantId,

      id,

      dto,
    );
  }
  @Delete(':id')
archive(
  @Request() req: any,

  @Param('id') id: string,
) {
  return this.productsService.archive(
    req.user.tenantId,

    id,
  );
}
}