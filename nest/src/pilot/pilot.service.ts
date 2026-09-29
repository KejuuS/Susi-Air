import { Injectable } from '@nestjs/common';
import { round1 } from '../common/utils/round';
import { FlightHoursRepository } from '../data/flight-hours.repository';
import { buildAvatarSvg } from './avatar';
import { PilotProfileDto } from './dto/pilot-profile.dto';

export const AVATAR_PATH = '/pilot/avatar.svg';

@Injectable()
export class PilotService {
  constructor(private readonly flightHoursRepository: FlightHoursRepository) {}

  getProfile(baseUrl: string): PilotProfileDto {
    const { name, totalFlightHours } = this.flightHoursRepository.getPilot();
    return {
      name,
      totalFlightHours: round1(totalFlightHours),
      avatarUrl: `${baseUrl}${AVATAR_PATH}`,
    };
  }

  getAvatarSvg(): string {
    return buildAvatarSvg(this.flightHoursRepository.getPilot().name);
  }
}
