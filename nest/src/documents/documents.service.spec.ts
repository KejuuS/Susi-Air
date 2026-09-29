import { DocumentsRepository } from '../data/documents.repository';
import { fixedClock } from '../testing/fixed-clock';
import { documentStatus, DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  it('computes days remaining and status for today = 2026-05-15, most urgent first', () => {
    const service = new DocumentsService(
      new DocumentsRepository(),
      fixedClock('2026-05-15'),
    );

    const result = service.getDocuments();

    expect(result.today).toBe('2026-05-15');
    expect(result.warningDays).toBe(30);
    expect(
      result.documents.map((d) => [d.id, d.daysRemaining, d.status]),
    ).toEqual([
      ['doc_security', -14, 'expired'],
      ['doc_license', 14, 'soon'],
      ['doc_medical', 27, 'soon'],
      ['doc_recurrent', 152, 'safe'],
      ['doc_ppc', 224, 'safe'],
    ]);
  });

  describe('documentStatus', () => {
    it.each([
      [-1, 'expired'],
      [0, 'expired'],
      [1, 'soon'],
      [30, 'soon'],
      [31, 'safe'],
    ])('%s days remaining is %s', (daysRemaining, expected) => {
      expect(documentStatus(daysRemaining, 30)).toBe(expected);
    });
  });
});
