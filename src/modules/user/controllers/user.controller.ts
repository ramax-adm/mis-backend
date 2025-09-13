import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { UserRole } from '@/core/enums/user-role.enum';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@/modules/user/entities/user.entity';
import { Roles } from '@/core/decorators/user-roles.decorator';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PasswordTokenDto } from '../dtos/password-token.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserAppWebpageService } from '../services/user-app-webpage.service';
import { UserService } from '../services/user.service';
import { USER_DEPARTMENTS } from '../constants/user-departments';

@ApiBearerAuth('jwt-token')
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userAppWebpageService: UserAppWebpageService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('add-user-app-webpage')
  addUserAppWebpage(@Body() dto: { userId: string; pageId: string }) {
    return this.userAppWebpageService.create(dto);
  }

  @Delete('user-app-webpage/:id')
  removeUserAppWebpage(@Param('id') id: string) {
    return this.userAppWebpageService.remove({ id });
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
  findAll(@Query('username') username?: string) {
    return this.userService.findAll(username);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.profile(id);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/filters/departments')
  getDepartments() {
    return USER_DEPARTMENTS;
  }
}
