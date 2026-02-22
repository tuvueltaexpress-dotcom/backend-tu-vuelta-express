import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  async register(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.register(
      createAdminDto.username,
      createAdminDto.email,
      createAdminDto.password,
    );
  }
}
