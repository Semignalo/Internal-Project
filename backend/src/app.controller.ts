import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('dashboard')
  getDashboard() {
    return this.appService.getDashboardData();
  }

  @Get('notifications')
  getNotifications(@Query('userId') userId?: string) {
    return this.appService.getNotifications(userId);
  }

  @Get('reports/team-performance')
  getTeamPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appService.getTeamPerformanceReport(startDate, endDate);
  }
}
