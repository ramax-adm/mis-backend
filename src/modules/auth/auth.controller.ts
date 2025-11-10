import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginUserDto } from '../user/dtos/login-user.dto';
import { ApiControllerDoc } from '@/core/decorators/api-doc.decorator';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { RolesGuard } from './guards/user-roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiControllerDoc({
    summary: 'Login Usuario',
    description: 'Realiza o login do usuario no app e no JWT',
    successStatus: HttpStatus.OK,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginUserDto) {
    return this.authService.login(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('verify-token')
  @HttpCode(HttpStatus.OK)
  verifyToken(@CurrentUser() user: User) {
    // O token é validado pelo JwtAuthGuard
    return user;
  }

  // @Post('auth/refresh')
  // async refresh(@Body() data: LoginUserDto) {
  //   return this.authService.refresh(data);
  // }
}
