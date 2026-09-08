import { z } from 'zod';

const MAX_BIGINT_ID = 9_223_372_036_854_775_807n;

const variantIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'Mã biến thể phải là số nguyên dương.')
  .max(19)
  .refine((value) => BigInt(value) <= MAX_BIGINT_ID, 'Mã biến thể nằm ngoài phạm vi hỗ trợ.');

const orderItemSchema = z.object({
  variantId: variantIdSchema,
  quantity: z.number().int().min(1).max(99),
});

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

const recipientSchema = z.object({
  name: requiredText('Họ tên người nhận', 100),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s.-]/g, ''))
    .refine(
      (value) => /^(?:\+84|0)\d{9,10}$/.test(value),
      'Số điện thoại cần bắt đầu bằng 0 hoặc +84 và có độ dài hợp lệ.',
    ),
  addressLine: requiredText('Số nhà và tên đường', 250),
  ward: optionalText(120),
  district: requiredText('Quận hoặc huyện', 120),
  province: requiredText('Tỉnh hoặc thành phố', 120),
});

export const createOrderRequestSchema = z
  .object({
    idempotencyKey: z.string().uuid('Mã chống tạo đơn trùng không hợp lệ.'),
    recipient: recipientSchema,
    note: optionalText(500),
    items: z.array(orderItemSchema).min(1).max(50),
  })
  .strict()
  .superRefine(({ items }, context) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.variantId)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'variantId'],
          message: 'Mỗi biến thể chỉ được gửi một lần.',
        });
      }
      seen.add(item.variantId);
    });
  });

export const orderParamsSchema = z.object({
  orderNumber: z.string().regex(/^EC\d{6}[A-Z0-9]{8}$/, 'Mã đơn hàng không hợp lệ.'),
});

export const zaloPayCallbackRequestSchema = z.object({
  data: z.string().min(2).max(20_000),
  mac: z.string().regex(/^[a-fA-F0-9]{64}$/),
  type: z.number().int().optional(),
});

export const zaloPayCallbackDataSchema = z.object({
  app_id: z.number().int(),
  app_trans_id: z.string().min(1).max(40),
  app_time: z.number().int(),
  app_user: z.string(),
  amount: z.number().int().positive(),
  zp_trans_id: z.union([z.number(), z.string()]),
  server_time: z.number().int().optional(),
}).passthrough();

export type CreateOrderInput = z.infer<typeof createOrderRequestSchema>;
