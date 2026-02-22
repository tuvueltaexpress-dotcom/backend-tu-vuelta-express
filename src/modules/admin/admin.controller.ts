import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginDto } from './dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  async register(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<{ message: string }> {
    return this.adminService.register(
      createAdminDto.username,
      createAdminDto.email,
      createAdminDto.password,
    );
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.adminService.login(loginDto.username, loginDto.password);
  }
}
