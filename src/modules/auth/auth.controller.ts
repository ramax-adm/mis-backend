import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UpdateResult } from 'typeorm';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginUserDto } from '../user/dtos/login-user.dto';

@ApiTags('Auth')
@Controller({ version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    description: 'User login',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: UpdateResult,
  })
  @Post('auth/login')
  async login(@Body() data: LoginUserDto) {
    return this.authService.login(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/verify-token')
  verifyToken() {
    // O token é validado pelo JwtAuthGuard
    return 'OK';
  }

  // @Post('auth/refresh')
  // async refresh(@Body() data: LoginUserDto) {
  //   return this.authService.refresh(data);
  // }
}
