import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';

/**
 * Workshop section 5 — skills exercise. Use the `ship` skill to review,
 * security-check, and commit changes in this module.
 */
@Module({
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
