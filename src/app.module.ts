import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { CloudinaryService } from './common/services/cloudinary.service';
import { AdminModule } from './modules/admin/admin.module';
import { StoresCategoriesModule } from './modules/stores-categories/stores-categories.module';
import { StoresModule } from './modules/stores/stores.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AdminModule,
    StoresCategoriesModule,
    StoresModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY || 'jf3-delivery-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, CloudinaryService],
  exports: [PrismaService, CloudinaryService],
})
export class AppModule {}
