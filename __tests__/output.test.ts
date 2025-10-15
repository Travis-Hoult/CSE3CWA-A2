/**
 * File: __tests__/output.test.ts
 * Purpose: End-to-end API test for Output CRUD happy path:
 *          POST /api/output  → create
 *          GET  /api/output  → list and find created row
 *          GET  /api/output/:id → fetch created row by id
 *
 * Provenance
 * - Lecture Source: Wk6/7 “API Testing with Jest + supertest” (pattern of POST→assert id→GET list→GET by id).
 * - Reuse: Exercises the project’s existing Output model & routes in app/api/output.
 * - AI Assist: Added TEST_BASE_URL for portability (local vs Docker), explicit JSON Content-Type,
 *              and stronger assertions (shape + content checks).
 * - Online Ref: supertest usage patterns (https://github.com/ladjs/supertest).
 */

import request from 'supertest'; // [ONLINE REF] supertest request pattern

// [AI-ASSIST] Allow overriding when hitting a Docker container or remote URL.
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Output API', () => {
  it('POST creates a record, then GET reads it back', async () => {
    // Arrange
    const html = '<!doctype html><html><body>Test</body></html>';
    const summary = { testRun: true, marker: 'autotest' };

    // Act: Create
    // [LECTURE] Typical POST -> expect 200 and an id in body
    const post = await request(BASE)
      .post('/api/output')
      .set('Content-Type', 'application/json')
      .send({ html, summary });

    // Assert: POST
    expect(post.status).toBe(200);
    expect(post.body).toHaveProperty('ok', true);
    expect(post.body).toHaveProperty('id');
    const id = post.body.id as number;

    // Act: List
    const list = await request(BASE).get('/api/output');

    // Assert: List shape
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.rows)).toBe(true);

    // Find the created row in list
    // (Using any here is fine for tests; we care about runtime shape)
    const found = (list.body.rows as any[]).find((r) => r.id === id);
    expect(found).toBeTruthy();

    // Content assertions
    expect(found.html).toContain('Test'); // sanity check on stored HTML
    expect(found.summary).toMatchObject(summary); // stored JSON round-trips

    // Act: Read by id
    const one = await request(BASE).get(`/api/output/${id}`);

    // Assert: Read by id
    expect(one.status).toBe(200);
    expect(one.body).toHaveProperty('row');
    expect(one.body.row.id).toBe(id);
    expect(one.body.row.html).toContain('Test');
  });
});

/* --- Provenance Map ---
- Lecture: Wk6/7 API testing flow (create → list → read), plus JSON assertions.
- Reuse: Validates Output routes implemented in app/api/output/route.ts and app/api/output/[id]/route.ts.
- Online: supertest request/response idioms.
- AI Assist: Environment override via TEST_BASE_URL; Content-Type header; stronger assertions.
------------------------ */