import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import type { ErrorResponse } from '../src/common/filters/all-exceptions.filter';

describe('Susi Air API (e2e)', () => {
  let app: NestExpressApplication;
  let server: App;
  let token: string;

  // Follows any .env overrides.
  const username = () => process.env.AUTH_USERNAME ?? 'johndoe';
  const password = () => process.env.AUTH_PASSWORD ?? 'susiairtest';

  function expectErrorShape(
    body: ErrorResponse,
    statusCode: number,
    path: string,
  ) {
    expect(body).toEqual({
      statusCode,
      error: expect.any(String),
      message: expect.any(String),
      details: expect.any(Array),
      path,
      timestamp: expect.any(String),
    });
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({
      logger: false,
    });
    configureApp(app);
    await app.init();
    server = app.getHttpServer();

    const login = await request(server)
      .post('/auth/login')
      .send({ username: username(), password: password() })
      .expect(200);
    token = (login.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth', () => {
    it('keeps /health public', async () => {
      const res = await request(server).get('/health').expect(200);
      expect(res.body).toEqual({ status: 'ok', today: expect.any(String) });
    });

    it.each(['/pilot/me', '/flight-hours/summary', '/documents', '/schedules'])(
      'rejects %s without a token, in the standard error shape',
      async (path) => {
        const res = await request(server).get(path).expect(401);

        expectErrorShape(res.body as ErrorResponse, 401, path);
        expect(res.body).toMatchObject({
          error: 'Unauthorized',
          message: 'Missing access token',
          details: [],
        });
      },
    );

    it('rejects an invalid token', async () => {
      const res = await request(server)
        .get('/documents')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);

      expect(res.body).toMatchObject({
        message: 'Invalid or expired access token',
      });
    });

    it('rejects wrong credentials with a clear message', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ username: username(), password: 'wrong' })
        .expect(401);

      expectErrorShape(res.body as ErrorResponse, 401, '/auth/login');
      expect(res.body).toMatchObject({
        message: 'Invalid username or password',
      });
    });

    it('returns a token, its lifetime and the pilot on success', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ username: username(), password: password() })
        .expect(200);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
        expiresIn: expect.any(Number),
        pilot: { name: 'John Doe' },
      });
    });

    it('accepts the token on a protected route', async () => {
      const res = await request(server)
        .get('/pilot/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual({
        name: 'John Doe',
        totalFlightHours: 1444.5,
        avatarUrl: expect.stringMatching(/\/pilot\/avatar\.svg$/),
      });
    });
  });

  describe('validation and errors', () => {
    it('lists every invalid field of a login body in details', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ username: '', extra: true })
        .expect(400);

      expectErrorShape(res.body as ErrorResponse, 400, '/auth/login');
      const fields = (res.body as ErrorResponse).details.map((d) => d.field);
      expect(fields).toEqual(
        expect.arrayContaining(['username', 'password', 'extra']),
      );
    });

    it('rejects a malformed JSON body with a 400', async () => {
      const res = await request(server)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"username":')
        .expect(400);

      expectErrorShape(res.body as ErrorResponse, 400, '/auth/login');
    });

    it('rejects from > to on /flight-hours', async () => {
      const path = '/flight-hours?from=2026-05-10&to=2026-05-01';
      const res = await request(server)
        .get(path)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expectErrorShape(res.body as ErrorResponse, 400, path);
      expect((res.body as ErrorResponse).details).toEqual([
        { field: 'to', messages: ['to must be on or after from'] },
      ]);
    });

    it.each([
      '/flight-hours?from=2026-5-1&to=2026-05-03',
      '/flight-hours?from=2026-02-30&to=2026-03-03',
      '/flight-hours?from=2026-05-01&to=2026-05-03&extra=1',
      '/flight-hours/summary?range=2w',
      '/schedules?year=2026&month=13',
      '/schedules?year=abc',
    ])('rejects %s', async (path) => {
      const res = await request(server)
        .get(path)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expectErrorShape(res.body as ErrorResponse, 400, path);
      expect((res.body as ErrorResponse).details.length).toBeGreaterThan(0);
    });

    it('returns 404 for unknown routes in the same shape', async () => {
      const res = await request(server).get('/does-not-exist').expect(404);

      expectErrorShape(res.body as ErrorResponse, 404, '/does-not-exist');
    });
  });

  describe('happy paths', () => {
    const get = (path: string) =>
      request(server).get(path).set('Authorization', `Bearer ${token}`);

    it('defaults the summary to 1w with 15 points and 4 cards', async () => {
      const res = await get('/flight-hours/summary').expect(200);

      expect(res.body).toMatchObject({ range: '1w', windowDays: 7 });
      const body = res.body as { points: unknown[]; cards: unknown[] };
      expect(body.points).toHaveLength(15);
      expect(body.cards).toHaveLength(4);
    });

    it('returns a dense daily series', async () => {
      const res = await get(
        '/flight-hours?from=2026-05-14&to=2026-05-16',
      ).expect(200);

      expect((res.body as { days: unknown[] }).days).toHaveLength(3);
    });

    it('returns the documents and a month of schedules', async () => {
      await get('/documents').expect(200);
      const res = await get('/schedules?year=2026&month=5').expect(200);

      expect(res.body).toMatchObject({ year: 2026, month: 5 });
    });

    it('serves the avatar image without a token', async () => {
      const res = await request(server).get('/pilot/avatar.svg').expect(200);

      expect(res.headers['content-type']).toContain('image/svg+xml');
    });
  });
});
