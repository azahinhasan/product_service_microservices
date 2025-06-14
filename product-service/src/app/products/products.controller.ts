import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../../guard/jwt-auth.guard';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { GetIssuer } from '../../decorators/get-issuer.decorator';
import { PaginationDto } from '../../common/pagination.dto';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @GetIssuer() issuer: any) {
    return this.productsService.create({ ...dto, createdBy: issuer.user.id });
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.productsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id, @GetIssuer() issuer: any) {
    return this.productsService.findOne(id, issuer.user.id);
  }

  @Put(':id')
  update(
    @GetIssuer() issuer: any,
    @Body() dto: UpdateProductDto,
    @Param('id') id: string,
  ) {
    return this.productsService.update({ ...dto, id }, issuer.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetIssuer() issuer: any) {
    return this.productsService.remove(id, issuer.user.id);
  }
}
