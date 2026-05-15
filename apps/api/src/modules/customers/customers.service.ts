import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateCustomerDto,
  ) {
    return this.prisma.customer.create({
      data: {
        tenantId,

        name: dto.name,

        phone: dto.phone,

        type: dto.type,

        creditLimit:
          dto.creditLimit || 0,
      },
    });
  }

 async findAll(
  tenantId: string,
) {
  const customers =
    await this.prisma.customer.findMany({
      where: {
        tenantId,
      },

      include: {
        ledgerEntries: true,
      },
    });

  return customers.map(
    (customer) => {
      const balance =
        customer.ledgerEntries.reduce(
          (
            sum,
            entry,
          ) => {
            if (
              entry.type ===
              'DEBIT'
            ) {
              return (
                sum +
                Number(
                  entry.amount,
                )
              );
            }

            if (
              entry.type ===
              'CREDIT'
            ) {
              return (
                sum -
                Number(
                  entry.amount,
                )
              );
            }

            return sum;
          },

          0,
        );

      return {
        id: customer.id,

        name:
          customer.name,

        phone:
          customer.phone,

        balance,
      };
    },
  );
}}