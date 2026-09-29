import { Controller, Get, Header, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import type { PilotProfileDto } from './dto/pilot-profile.dto';
import { PilotService } from './pilot.service';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  @Get('me')
  getMe(@Req() request: Request): PilotProfileDto {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return this.pilotService.getProfile(baseUrl);
  }

  /** Public so the image can load in an <img> tag. */
  @Public()
  @Get('avatar.svg')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', 'public, max-age=86400')
  getAvatar(): string {
    return this.pilotService.getAvatarSvg();
  }
}
