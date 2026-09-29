import { Controller, Get } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly clock: ClockService) {}

  @Public()
  @Get()
  check(): { status: 'ok'; today: string } {
    return { status: 'ok', today: this.clock.today() };
  }
}
