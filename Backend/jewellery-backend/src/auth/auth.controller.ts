import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }
  @Post('vendor/login')
  vendorLogin(@Body() body: { email: string; password: string }) {
    return this.authService.vendorLogin(body.email, body.password);
  }
}
