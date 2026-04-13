import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { Product } from './modules/products/entities/product.entity';
import { Review } from './modules/products/entities/review.entity';
import { ProductImage } from './modules/products/entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db/workshop.sqlite',
      entities: [Product, Review, ProductImage],
      synchronize: true,
    }),
    ProductsModule,
  ],
})
export class AppModule {}
