import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
  ) {
    const user =
      await this.authService.validateUser(
        dto.email,
        dto.password,
      );

    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req: any) {
    return req.user;
  }
}