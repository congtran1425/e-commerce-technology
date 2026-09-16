import { z } from 'zod';

const MAX_BIGINT_ID = 9_223_372_036_854_775_807n;

const bigintIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'Mã dữ liệu phải là số nguyên dương.')
  .max(19)
  .refine((value) => {
    try {
      return BigInt(value) <= MAX_BIGINT_ID;
    } catch {
      return false;
    }
  }, 'Mã dữ liệu nằm ngoài phạm vi hỗ trợ.');

const requiredText = (label: string, maximum: number) => z
  .string()
  .trim()
  .min(1, `${label} không được để trống.`)
  .max(maximum, `${label} không được dài quá ${maximum} ký tự.`);

const optionalText = (maximum: number) => z
  .string()
  .trim()
  .max(maximum)
  .transform((value) => value || undefined)
  .optional();

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .refine(
    (value) => /^(?:\+84|0)\d{9,10}$/.test(value),
    'Số điện thoại cần bắt đầu bằng 0 hoặc +84 và có độ dài hợp lệ.',
  );

const addressFields = {
  label: requiredText('Tên gợi nhớ', 40),
  recipientName: requiredText('Họ tên người nhận', 100),
  phone: phoneSchema,
  addressLine: requiredText('Số nhà và tên đường', 250),
  ward: optionalText(120),
  district: requiredText('Quận hoặc huyện', 120),
  province: requiredText('Tỉnh hoặc thành phố', 120),
} as const;

export const updateProfileRequestSchema = z
  .object({
    displayName: requiredText('Tên hiển thị', 100).min(2, 'Tên hiển thị cần có ít nhất 2 ký tự.').optional(),
    phone: z
      .union([phoneSchema, z.literal('').transform(() => null), z.null()])
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Cần gửi ít nhất một thông tin cần sửa.');

export const createAddressRequestSchema = z
  .object({
    ...addressFields,
    isDefault: z.boolean().optional().default(false),
  })
  .strict();

export const updateAddressRequestSchema = z
  .object({
    label: addressFields.label.optional(),
    recipientName: addressFields.recipientName.optional(),
    phone: addressFields.phone.optional(),
    addressLine: addressFields.addressLine.optional(),
    ward: optionalText(120).or(z.null()),
    district: addressFields.district.optional(),
    province: addressFields.province.optional(),
    isDefault: z.literal(true).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Cần gửi ít nhất một thông tin cần sửa.');

export const addressParamsSchema = z.object({ addressId: bigintIdSchema });

export const accountOrderListQuerySchema = z.object({
  cursor: bigintIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  status: z.enum([
    'AWAITING_PAYMENT',
    'CONFIRMED',
    'PAYMENT_REVIEW',
    'PREPARING',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED',
  ]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileRequestSchema>;
export type CreateAddressInput = z.infer<typeof createAddressRequestSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressRequestSchema>;
export type AccountOrderListQuery = z.infer<typeof accountOrderListQuerySchema>;
