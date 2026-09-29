import { Controller, Get } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import type { DocumentsResponseDto } from './dto/documents-response.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  getDocuments(): DocumentsResponseDto {
    return this.documentsService.getDocuments();
  }
}
