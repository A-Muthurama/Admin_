import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class AdminForgotPasswordRequestDto {
  @IsEmail()
  email: string;
}

export class AdminForgotPasswordVerifyDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

export class AdminForgotPasswordResetDto {
  @IsString()
  reset_token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
