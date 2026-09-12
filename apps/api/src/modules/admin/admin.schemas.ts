import { z } from 'zod';

const MAX_BIGINT_ID = 9_223_372_036_854_775_807n;

export const adminIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'Mã định danh phải là số nguyên dương.')
  .max(19)
  .refine((value) => BigInt(value) <= MAX_BIGINT_ID, 'Mã định danh nằm ngoài phạm vi hỗ trợ.');

const requiredText = (label: string, maximum: number) => z
  .string()
  .trim()
  .min(1, `${label} không được để trống.`)
  .max(maximum, `${label} không được dài quá ${maximum} ký tự.`);

const optionalImageUrl = z
  .union([z.url('Địa chỉ ảnh phải là URL hợp lệ.'), z.literal(''), z.null()])
  .transform((value) => value || null)
  .optional();

const measurementUnitSchema = z.enum(['GRAM', 'MILLILITER', 'PIECE']);

const variantFields = {
  label: requiredText('Tên quy cách', 180),
  unit: measurementUnitSchema,
  packageQuantity: z.number().positive().max(1_000_000).multipleOf(0.001),
  price: z.number().int().min(0).max(999_999_999),
  active: z.boolean().optional().default(true),
};

export const createVariantSchema = z.object({
  sku: requiredText('Mã hàng', 80)
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z0-9][A-Z0-9._-]*$/.test(value), 'Mã hàng chỉ dùng chữ in hoa, số, dấu chấm, gạch ngang hoặc gạch dưới.'),
  ...variantFields,
  stockQuantity: z.number().int().min(0).max(1_000_000),
}).strict();

export const createProductSchema = z.object({
  name: requiredText('Tên sản phẩm', 180),
  description: requiredText('Mô tả', 500),
  kind: z.enum(['INGREDIENT', 'TOOL']),
  imageUrl: optionalImageUrl,
  active: z.boolean().optional().default(true),
  variants: z.array(createVariantSchema).min(1, 'Sản phẩm cần ít nhất một quy cách bán.').max(20),
}).strict().superRefine(({ variants }, context) => {
  const seen = new Set<string>();
  variants.forEach((variant, index) => {
    if (seen.has(variant.sku)) {
      context.addIssue({ code: 'custom', path: ['variants', index, 'sku'], message: 'Mã hàng trong cùng sản phẩm không được trùng.' });
    }
    seen.add(variant.sku);
  });
});

export const updateProductSchema = z.object({
  name: requiredText('Tên sản phẩm', 180).optional(),
  description: requiredText('Mô tả', 500).optional(),
  imageUrl: optionalImageUrl,
  active: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'Cần gửi ít nhất một thay đổi.');

export const updateVariantSchema = z.object({
  label: variantFields.label.optional(),
  unit: variantFields.unit.optional(),
  packageQuantity: variantFields.packageQuantity.optional(),
  price: variantFields.price.optional(),
  active: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'Cần gửi ít nhất một thay đổi.');

export const adjustInventorySchema = z.object({
  quantityDelta: z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0, 'Số lượng thay đổi phải khác 0.'),
  reason: z.enum(['RESTOCK', 'CORRECTION', 'DAMAGED', 'RETURNED']),
  note: z.string().trim().max(300).transform((value) => value || undefined).optional(),
}).strict().superRefine(({ quantityDelta, reason }, context) => {
  if ((reason === 'RESTOCK' || reason === 'RETURNED') && quantityDelta < 0) {
    context.addIssue({ code: 'custom', path: ['quantityDelta'], message: 'Nhập hàng hoặc hàng hoàn phải làm tồn kho tăng.' });
  }
  if (reason === 'DAMAGED' && quantityDelta > 0) {
    context.addIssue({ code: 'custom', path: ['quantityDelta'], message: 'Hư hỏng hoặc hao hụt phải làm tồn kho giảm.' });
  }
});

export const adminProductListQuerySchema = z.object({
  q: z.string().trim().max(80).transform((value) => value || undefined).optional(),
  status: z.enum(['ALL', 'ACTIVE', 'INACTIVE']).optional().default('ALL'),
  cursor: adminIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const inventoryHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

const orderStatusSchema = z.enum([
  'AWAITING_PAYMENT',
  'CONFIRMED',
  'PAYMENT_REVIEW',
  'PREPARING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
]);

const paymentStatusSchema = z.enum([
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
  'REFUND_PENDING',
  'REFUNDED',
]);

const paginatedAdminQuery = {
  q: z.string().trim().max(80).transform((value) => value || undefined).optional(),
  cursor: adminIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
};

export const adminOrderListQuerySchema = z.object({
  ...paginatedAdminQuery,
  status: z.union([orderStatusSchema, z.literal('ALL')]).optional().default('ALL'),
});

export const adminPaymentListQuerySchema = z.object({
  ...paginatedAdminQuery,
  status: z.union([paymentStatusSchema, z.literal('ALL')]).optional().default('ALL'),
});

export const adminInventoryOverviewQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED']),
}).strict();

export const orderParamsSchema = z.object({
  orderNumber: z.string().trim().regex(/^EC[A-Z0-9]{6,22}$/, 'Mã đơn hàng không hợp lệ.'),
});

export const productParamsSchema = z.object({ productId: adminIdSchema });
export const variantParamsSchema = z.object({ variantId: adminIdSchema });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type AdminPaymentListQuery = z.infer<typeof adminPaymentListQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
