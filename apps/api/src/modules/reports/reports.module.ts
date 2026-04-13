import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';

/**
 * Workshop section 4 — agents exercise. Small module with a deliberately
 * imperfect controller to review. Make changes here and run the code-reviewer
 * agent on the diff.
 */
@Module({
  controllers: [ReportsController],
})
export class ReportsModule {}
