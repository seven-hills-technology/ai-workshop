import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelloModule } from './modules/hello/hello.module';
import { TodosModule } from './modules/todos/todos.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
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
    HelloModule,
    TodosModule,
    NotificationsModule,
    ReportsModule,
    AnalyticsModule,
    ProductsModule,
  ],
})
export class AppModule {}
