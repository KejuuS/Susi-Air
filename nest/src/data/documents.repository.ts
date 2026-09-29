import { Injectable } from '@nestjs/common';
import type { DocumentRecord, DocumentsFile } from './data.types';
import documentsJson from './json/mock-documents.json';

const data: DocumentsFile = documentsJson;

@Injectable()
export class DocumentsRepository {
  getDocuments(): readonly DocumentRecord[] {
    return data.documents;
  }

  getWarningDays(): number {
    return data.thresholds.warningDays;
  }
}
