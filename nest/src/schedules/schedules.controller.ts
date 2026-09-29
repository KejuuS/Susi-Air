import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesQueryDto } from './dto/schedules-query.dto';
import type { SchedulesResponseDto } from './dto/schedules-response.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  getMonth(@Query() query: SchedulesQueryDto): SchedulesResponseDto {
    return this.schedulesService.getMonth(query.year, query.month);
  }
}
