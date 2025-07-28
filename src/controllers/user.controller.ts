import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { Roles } from '@/core/decorators/user-roles.decorator';
import { UserRole } from '@/core/enums/user-role.enum';
import { User } from '@/core/user';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { ChangePasswordDto } from '@/modules/user/dto/change-password.dto';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { PasswordTokenDto } from '@/modules/user/dto/password-token.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UserService } from '@/modules/user/user.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiBearerAuth('jwt-token')
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: { email: string }) {
    return this.userService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('check-password-token')
  checkPasswordToken(@Body() passwordTokenDto: PasswordTokenDto) {
    return this.userService.checkPasswordToken(passwordTokenDto);
  }

  @Post('change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.resetPassword(changePasswordDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profile')
  profile(@CurrentUser() user: User) {
    const userId = user.id;
    return this.userService.profile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Query('roles') roles?: string[]) {
    return this.userService.findAll(roles);
  }

  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
