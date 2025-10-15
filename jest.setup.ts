// jest.setup.ts
// Ensure tests don’t call a real Lambda by default
process.env.LAMBDA_URL = process.env.LAMBDA_URL || "";
// Force test database file (if lib/db.ts reads DATABASE_FILE)
process.env.DATABASE_FILE = process.env.DATABASE_FILE || "data/test.sqlite";
// Mark environment
process.env.NODE_ENV = "test";