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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/services/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from '@/services/user/dto/change-password.dto';
import { CreateUserDto } from '@/services/user/dto/create-user.dto';
import { PasswordTokenDto } from '@/services/user/dto/password-token.dto';
import { UpdateUserDto } from '@/services/user/dto/update-user.dto';
import { UserService } from '@/services/user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@/services/user/entities/user.entity';
import { Roles } from '@/common/decorators/user-roles.decorator';
import { RolesGuard } from '@/services/auth/guards/user-roles.guard';

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
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
