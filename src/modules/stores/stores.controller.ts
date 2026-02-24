import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.remove(id);
  }
}
