import { IsIn, IsOptional } from 'class-validator';
import { CHART_RANGES, type ChartRange } from '../../data/data.types';

export class SummaryQueryDto {
  @IsOptional()
  @IsIn(CHART_RANGES, {
    message: `range must be one of: ${CHART_RANGES.join(', ')}`,
  })
  range: ChartRange = '1w';
}
