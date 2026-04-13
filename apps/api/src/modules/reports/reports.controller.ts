import { Controller, Get, Query } from '@nestjs/common';

type ReportRow = { label: string; value: number };

@Controller('reports')
export class ReportsController {
  @Get('summary')
  summary(@Query('range') range?: string): ReportRow[] {
    // Placeholder data. Workshop section 4: modify this endpoint and run the
    // code-reviewer agent on the diff.
    const base: ReportRow[] = [
      { label: 'todos opened', value: 12 },
      { label: 'todos completed', value: 8 },
    ];
    if (range === 'week') {
      return base.map((row) => ({ ...row, value: row.value * 7 }));
    }
    return base;
  }
}
