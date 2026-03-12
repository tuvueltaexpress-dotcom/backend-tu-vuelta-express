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
  Query,
  DefaultValuePipe,
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
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('categoryId') categoryId?: string,
  ) {
    const categoryIdNumber = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.storesService.findAll(page, limit, categoryIdNumber);
  }

  @Get(':id')
  findOne(@Param('id') idOrSlug: string) {
    const isNumeric = /^\d+$/.test(idOrSlug);
    if (isNumeric) {
      return this.storesService.findOne(parseInt(idOrSlug, 10));
    }
    return this.storesService.findOneBySlug(idOrSlug);
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
