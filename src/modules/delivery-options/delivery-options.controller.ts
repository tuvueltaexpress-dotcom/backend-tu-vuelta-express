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
import { DeliveryOptionsService } from './delivery-options.service';
import { CreateDeliveryOptionDto, UpdateDeliveryOptionDto } from './dto';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('delivery-options')
export class DeliveryOptionsController {
  constructor(
    private readonly deliveryOptionsService: DeliveryOptionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDeliveryOptionDto: CreateDeliveryOptionDto) {
    return this.deliveryOptionsService.create(createDeliveryOptionDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.deliveryOptionsService.findAll(page, limit);
  }

  @Get('store/:storeId')
  findByStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.deliveryOptionsService.findByStore(storeId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryOptionsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryOptionDto: UpdateDeliveryOptionDto,
  ) {
    return this.deliveryOptionsService.update(id, updateDeliveryOptionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryOptionsService.remove(id);
  }
}
