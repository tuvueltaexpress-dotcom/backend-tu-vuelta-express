import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('partners/pending')
  @UseGuards(JwtAuthGuard)
  getPendingPartners() {
    return this.adminService.getPendingPartners();
  }

  @Patch('partners/:id/approve')
  @UseGuards(JwtAuthGuard)
  approvePartner(@Param('id') id: string) {
    return this.adminService.approvePartner(+id);
  }

  @Patch('partners/:id/reject')
  @UseGuards(JwtAuthGuard)
  rejectPartner(@Param('id') id: string) {
    return this.adminService.rejectPartner(+id);
  }
}
