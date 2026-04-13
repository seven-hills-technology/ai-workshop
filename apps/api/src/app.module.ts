import { Module } from '@nestjs/common';
import { HelloModule } from './modules/hello/hello.module';
import { TodosModule } from './modules/todos/todos.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    HelloModule,
    TodosModule,
    NotificationsModule,
    ReportsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
