import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  BulkAdjustInput,
  BulkAdjustResult,
  InventoryUpdateInput,
  ProductListQuery,
  ProductListResponse,
} from './product.types';
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
      lowStock: query.lowStock,
    });
  }

  @Get('categories')
  categories(): Promise<string[]> {
    return this.products.getCategories();
  }

  @Post('inventory/bulk')
  bulkAdjust(@Body() input: BulkAdjustInput): Promise<BulkAdjustResult> {
    return this.products.bulkAdjust(input);
  }

  @Patch(':id/inventory')
  updateInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: InventoryUpdateInput,
  ): Promise<Product> {
    return this.products.updateInventory(id, input);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.products.findOne(id);
  }
}
