import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },

      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    return user;
  }

  async login(user: any) {
    const permissions =
      user.role.permissions.map(
        (p) => p.permission.key,
      );

    const payload = {
      sub: user.id,

      tenantId: user.tenantId,

      roleId: user.roleId,

      permissions,
    };

    return {
      access_token:
        this.jwtService.sign(payload),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        permissions,
      },
    };
  }
}