import { Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { diffDays } from '../common/date/iso-date';
import { DocumentsRepository } from '../data/documents.repository';
import {
  DocumentsResponseDto,
  DocumentStatus,
  PilotDocumentDto,
} from './dto/documents-response.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly clock: ClockService,
  ) {}

  getDocuments(): DocumentsResponseDto {
    const today = this.clock.today();
    const warningDays = this.repository.getWarningDays();

    const documents: PilotDocumentDto[] = this.repository
      .getDocuments()
      .map((document) => {
        const daysRemaining = diffDays(document.expiryDate, today);
        return {
          id: document.id,
          label: document.label,
          expiryDate: document.expiryDate,
          daysRemaining,
          status: documentStatus(daysRemaining, warningDays),
        };
      })
      // Most urgent first.
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { today, warningDays, documents };
  }
}

export function documentStatus(
  daysRemaining: number,
  warningDays: number,
): DocumentStatus {
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= warningDays) return 'soon';
  return 'safe';
}
