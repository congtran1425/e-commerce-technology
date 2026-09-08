import 'dotenv/config';
import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().url().optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL chưa được cấu hình.'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  ZALOPAY_APP_ID: optionalString,
  ZALOPAY_KEY1: optionalString,
  ZALOPAY_KEY2: optionalString,
  ZALOPAY_CALLBACK_URL: optionalUrl,
  ZALOPAY_REDIRECT_URL: optionalUrl,
  ZALOPAY_CREATE_URL: optionalUrl,
  ZALOPAY_QUERY_URL: optionalUrl,
  ZALOPAY_EXPIRE_SECONDS: z.coerce.number().int().min(300).max(2_592_000).default(900),
}).superRefine((value, context) => {
  const required = [
    ['ZALOPAY_APP_ID', value.ZALOPAY_APP_ID],
    ['ZALOPAY_KEY1', value.ZALOPAY_KEY1],
    ['ZALOPAY_KEY2', value.ZALOPAY_KEY2],
    ['ZALOPAY_CALLBACK_URL', value.ZALOPAY_CALLBACK_URL],
    ['ZALOPAY_REDIRECT_URL', value.ZALOPAY_REDIRECT_URL],
  ] as const;
  const configuredCount = required.filter(([, configuredValue]) => configuredValue).length;

  if (configuredCount > 0 && configuredCount < required.length) {
    required.forEach(([name, configuredValue]) => {
      if (!configuredValue) {
        context.addIssue({
          code: 'custom',
          path: [name],
          message: `Cần cấu hình ${name} khi bật ZaloPay.`,
        });
      }
    });
  }
});

const parsed = envSchema.parse(process.env);
const hasZaloPayConfig = Boolean(
  parsed.ZALOPAY_APP_ID
  && parsed.ZALOPAY_KEY1
  && parsed.ZALOPAY_KEY2
  && parsed.ZALOPAY_CALLBACK_URL
  && parsed.ZALOPAY_REDIRECT_URL,
);

export const env = {
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  databaseUrl: parsed.DATABASE_URL,
  sessionTtlDays: parsed.SESSION_TTL_DAYS,
  corsOrigins: parsed.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  zaloPay: hasZaloPayConfig ? {
    appId: parsed.ZALOPAY_APP_ID as string,
    key1: parsed.ZALOPAY_KEY1 as string,
    key2: parsed.ZALOPAY_KEY2 as string,
    callbackUrl: parsed.ZALOPAY_CALLBACK_URL as string,
    redirectUrl: parsed.ZALOPAY_REDIRECT_URL as string,
    createUrl: parsed.ZALOPAY_CREATE_URL ?? 'https://sb-openapi.zalopay.vn/v2/create',
    queryUrl: parsed.ZALOPAY_QUERY_URL ?? 'https://sb-openapi.zalopay.vn/v2/query',
    expireSeconds: parsed.ZALOPAY_EXPIRE_SECONDS,
  } : null,
} as const;
