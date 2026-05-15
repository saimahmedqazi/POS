import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('test-db')
  async testDb() {
    return this.prisma.user.findMany();
  }
}