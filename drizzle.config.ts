import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load env for CLI usage (drizzle-kit doesn't load Next.js env automatically)
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local (local) or your Neon/Vercel env vars.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
