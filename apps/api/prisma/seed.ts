import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant =
    await prisma.tenant.create({
      data: {
        name: 'Demo Tenant',
      },
    });

  const role =
    await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'ADMIN',
      },
    });

  const permissions = [
    'users.view',
    'users.create',
    'inventory.view',
    'inventory.update',
    'sales.create',
    'ledger.view',
  ];

  for (const key of permissions) {
    const permission =
      await prisma.permission.create({
        data: {
          key,
        },
      });

    await prisma.rolePermission.create({
      data: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });
  }

  const passwordHash =
    await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      tenantId: tenant.id,

      roleId: role.id,

      name: 'Admin',

      email: 'admin@test.com',

      passwordHash,
    },
  });

  console.log('Seed complete');
}

main();