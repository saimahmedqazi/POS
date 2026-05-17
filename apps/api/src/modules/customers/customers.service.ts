import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../../common/prisma/prisma.service';

import {
  CreateCustomerDto,
} from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateCustomerDto,
  ) {
    const existingCustomer =
      await this.prisma.customer.findFirst({
        where: {
          tenantId,

          phone:
            dto.phone,
        },
      });

    if (
      existingCustomer
    ) {
      throw new ConflictException(
        'Customer with this phone already exists',
      );
    }

    return this.prisma.customer.create({
      data: {
        tenantId,

        name:
          dto.name.trim(),

        phone:
          dto.phone.trim(),

        type:
          dto.type,

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

        orderBy: {
          createdAt:
            'desc',
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
          id:
            customer.id,

          name:
            customer.name,

          phone:
            customer.phone,

          balance,

          creditLimit:
            Number(
              customer.creditLimit,
            ),
        };
      },
    );
  }
}