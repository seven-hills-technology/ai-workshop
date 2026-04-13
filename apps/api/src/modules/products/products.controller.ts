import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductListQuery, ProductListResponse } from './product.types';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: ProductListQuery): Promise<ProductListResponse> {
    return this.products.findAll({
      ...query,
      skip: query.skip ? Number(query.skip) : 0,
      limit: query.limit ? Math.min(Number(query.limit), 100) : 20,
    });
  }

  @Get('categories')
  categories(): Promise<string[]> {
    return this.products.getCategories();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.products.findOne(id);
  }
}
