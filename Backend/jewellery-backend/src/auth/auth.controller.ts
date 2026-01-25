import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AdminForgotPasswordRequestDto,
  AdminForgotPasswordResetDto,
  AdminForgotPasswordVerifyDto,
} from './dto/admin-forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Post('admin/forgot-password/request')
  adminForgotPasswordRequest(@Body() body: AdminForgotPasswordRequestDto) {
    return this.authService.adminForgotPasswordRequest(body.email);
  }

  @Post('admin/forgot-password/verify')
  adminForgotPasswordVerify(@Body() body: AdminForgotPasswordVerifyDto) {
    return this.authService.adminForgotPasswordVerify(body.email, body.otp);
  }

  @Post('admin/forgot-password/reset')
  adminForgotPasswordReset(@Body() body: AdminForgotPasswordResetDto) {
    return this.authService.adminForgotPasswordReset(
      body.reset_token,
      body.password,
    );
  }
  @Post('vendor/login')
  vendorLogin(@Body() body: { email: string; password: string }) {
    return this.authService.vendorLogin(body.email, body.password);
  }
}
