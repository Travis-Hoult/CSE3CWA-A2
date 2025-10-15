import request from 'supertest';
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Output API', () => {
  it('POST creates a record, then GET reads it back', async () => {
    const html = '<!doctype html><html><body>Test</body></html>';
    const summary = { testRun: true, marker: 'autotest' };

    const post = await request(BASE)
      .post('/api/output')
      .send({ html, summary })
      .set('Content-Type', 'application/json');

    expect(post.status).toBe(200);
    expect(post.body).toHaveProperty('id');
    const id = post.body.id;

    const list = await request(BASE).get('/api/output');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.rows)).toBe(true);

    const found = list.body.rows.find((r: any) => r.id === id);
    expect(found).toBeTruthy();
    expect(found.html).toContain('Test');
    expect(found.summary).toMatchObject(summary);

    const one = await request(BASE).get(`/api/output/${id}`);
    expect(one.status).toBe(200);
    expect(one.body.row.id).toBe(id);
  });
});