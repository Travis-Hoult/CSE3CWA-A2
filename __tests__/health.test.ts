/**
 * File: __tests__/health.test.ts
 * Purpose: Automated API test to verify /api/health returns 200 and DB status "up".
 *
 * Provenance
 * - Source: Lecture Wk6 “Intro to Automated Testing (API with Jest + supertest)” – pattern of request/assert.
 * - Reuse: Uses the project’s existing /api/health endpoint contract (ok/db/elapsedMs).
 * - AI Assist: Suggested TEST_BASE_URL for flexibility, clarified assertions, and added type-friendly checks.
 * - Online Ref: supertest usage pattern (https://github.com/ladjs/supertest)
 */

import request from 'supertest'; // [ONLINE REF] supertest request pattern (see link above)

// Allow overriding base URL when running against Docker or remote envs.
// [AI-ASSIST]: TEST_BASE_URL makes the test portable (local/dev/CI).
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('GET /api/health', () => {
  it('returns 200 and indicates DB is up', async () => {
    // [LECTURE Wk6]: basic GET + status + JSON body assertions
    const res = await request(BASE).get('/api/health');

    // Status code contract
    expect(res.status).toBe(200);

    // Response envelope contract
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('db', 'up');

    // Timing is numeric and non-negative (loose check to avoid flakiness)
    expect(typeof res.body.elapsedMs).toBe('number'); // [AI-ASSIST]: type-safe, environment-agnostic
    expect(res.body.elapsedMs).toBeGreaterThanOrEqual(0);
  });
});

/* --- Provenance Map ---
- Lecture: Wk6 API tests with Jest/supertest (request -> expect).
- Reuse: Assumes /api/health returns { ok, db, elapsedMs } as defined in app/api/health/route.ts.
- Online: supertest docs for request patterns.
- AI Assist: BASE config, clarified assertions, added non-negative timing check.
------------------------ */