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
import { ChangePasswordDto } from '@/modules/user/dto/change-password.dto';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { PasswordTokenDto } from '@/modules/user/dto/password-token.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UserService } from '@/modules/user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@/modules/user/entities/user.entity';
import { Roles } from '@/core/decorators/user-roles.decorator';
import { RolesGuard } from '@/modules/auth/guards/user-roles.guard';
import { UserSensattaCompanyService } from '@/modules/user/user-sensatta-company.service';
import { UserAppWebpageService } from '@/modules/user/user-app-webpage.service';

@ApiBearerAuth('jwt-token')
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userAppWebpageService: UserAppWebpageService,
    private readonly userCompanyService: UserSensattaCompanyService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('add-user-company')
  addUserCompany(@Body() dto: { userId: string; companyCode: string }) {
    return this.userCompanyService.create(dto);
  }

  @Post('add-user-app-webpage')
  addUserAppWebpage(@Body() dto: { userId: string; pageId: string }) {
    return this.userAppWebpageService.create(dto);
  }

  @Delete('user-app-webpage/:id')
  removeUserAppWebpage(@Param('id') id: string) {
    return this.userAppWebpageService.remove({ id });
  }

  @Delete('user-company/:id')
  removeUserCompany(@Param('id') id: string) {
    return this.userCompanyService.remove({ id });
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
}
