import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Vini' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'vini@cios.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '33344455566' })
  @IsNotEmpty()
  @IsString()
  cpf: string;

  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  role: string;
}
