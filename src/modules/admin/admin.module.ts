import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  controllers: [AdminController],
  providers: [AdminService, JwtAuthGuard],
  exports: [AdminService],
})
export class AdminModule {}
