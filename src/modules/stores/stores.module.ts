import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Module({
  controllers: [StoresController],
  providers: [StoresService, CloudinaryService],
  exports: [StoresService],
})
export class StoresModule {}
