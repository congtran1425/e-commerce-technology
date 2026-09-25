import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('Email chưa đúng định dạng.')
  .max(254, 'Email không được dài quá 254 ký tự.')
  .transform((value) => value.toLocaleLowerCase('en-US'));

const passwordSchema = z
  .string()
  .min(10, 'Mật khẩu cần có ít nhất 10 ký tự.')
  .max(128, 'Mật khẩu không được dài quá 128 ký tự.');

export const registerRequestSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Tên hiển thị cần có ít nhất 2 ký tự.')
    .max(100, 'Tên hiển thị không được dài quá 100 ký tự.'),
  email: emailSchema,
  password: passwordSchema,
}).strict();

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}).strict();

export const emailOnlyRequestSchema = z.object({ email: emailSchema }).strict();
export const accountTokenRequestSchema = z.object({ token: z.string().length(43) }).strict();
export const resetPasswordRequestSchema = z.object({
  token: z.string().length(43),
  password: passwordSchema,
}).strict();

export type RegisterInput = z.infer<typeof registerRequestSchema>;
export type LoginInput = z.infer<typeof loginRequestSchema>;
