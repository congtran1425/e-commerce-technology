import 'dotenv/config';

const parsedPort = Number.parseInt(process.env.PORT ?? '3000', 10);

if (Number.isNaN(parsedPort)) {
  throw new Error('PORT phải là một số nguyên hợp lệ.');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsedPort,
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
