import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AdminModule } from './modules/admin/admin.module';

@Global()
@Module({
  imports: [
    AdminModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY || 'jf3-delivery-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
