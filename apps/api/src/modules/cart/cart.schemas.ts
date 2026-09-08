import { z } from 'zod';

const MAX_BIGINT_ID = 9_223_372_036_854_775_807n;

const variantIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'Mã biến thể phải là số nguyên dương.')
  .max(19)
  .refine((value) => BigInt(value) <= MAX_BIGINT_ID, 'Mã biến thể nằm ngoài phạm vi hỗ trợ.');

const cartQuoteItemSchema = z.object({
  variantId: variantIdSchema,
  quantity: z.number().int().min(1).max(99),
});

export const cartQuoteRequestSchema = z
  .object({
    items: z.array(cartQuoteItemSchema).min(1).max(50),
  })
  .superRefine(({ items }, context) => {
    const seenVariantIds = new Set<string>();

    items.forEach((item, index) => {
      if (seenVariantIds.has(item.variantId)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'variantId'],
          message: 'Mỗi biến thể chỉ được gửi một lần.',
        });
      }
      seenVariantIds.add(item.variantId);
    });
  });

export type CartQuoteRequest = z.infer<typeof cartQuoteRequestSchema>;
