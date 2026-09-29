import { Controller, Get, Query } from '@nestjs/common';
import type { DailyHoursResponseDto } from './dto/daily-hours-response.dto';
import { FlightHoursQueryDto } from './dto/flight-hours-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';
import type { FlightHoursSummaryDto } from './dto/summary-response.dto';
import { FlightHoursService } from './flight-hours.service';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get()
  getDailyHours(@Query() query: FlightHoursQueryDto): DailyHoursResponseDto {
    return this.flightHoursService.getDailyHours(query.from, query.to);
  }

  @Get('summary')
  getSummary(@Query() query: SummaryQueryDto): FlightHoursSummaryDto {
    return this.flightHoursService.getSummary(query.range);
  }
}
