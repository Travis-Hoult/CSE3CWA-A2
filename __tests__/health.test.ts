import request from 'supertest';
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('GET /api/health', () => {
  it('returns 200 and indicates DB is up', async () => {
    const res = await request(BASE).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('db', 'up');
    expect(typeof res.body.elapsedMs).toBe('number');
  });
});