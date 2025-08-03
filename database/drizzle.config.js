import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: String(Bun.env.DATABASE_URL) }
});