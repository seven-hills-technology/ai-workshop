import { Controller, Get } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  @Get('health')
  health(): { ok: true } {
    return { ok: true };
  }
}
