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
import { StoresCategoriesService } from './stores-categories.service';
import { CreateStoresCategoryDto } from './dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('stores-categories')
export class StoresCategoriesController {
  constructor(
    private readonly storesCategoriesService: StoresCategoriesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createStoresCategoryDto: CreateStoresCategoryDto) {
    return this.storesCategoriesService.create(createStoresCategoryDto.name);
  }

  @Get()
  findAll() {
    return this.storesCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesCategoriesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() createStoresCategoryDto: CreateStoresCategoryDto,
  ) {
    return this.storesCategoriesService.update(
      id,
      createStoresCategoryDto.name,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storesCategoriesService.remove(id);
  }
}
