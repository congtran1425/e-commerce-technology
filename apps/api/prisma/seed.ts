import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, MeasurementUnit, ProductKind, UserRole } from '../src/generated/prisma/client.js';
import { registerRequestSchema } from '../src/modules/auth/auth.schemas.js';
import { hashPassword } from '../src/modules/auth/password.js';
import { importedRecipeSeeds } from './recipe-seed-data.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL chưa được cấu hình.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

function readUserSeedInput(prefix: 'SEED_ADMIN' | 'SEED_CUSTOMER', label: string, fallbackName: string) {
  const email = process.env[`${prefix}_EMAIL`]?.trim();
  const password = process.env[`${prefix}_PASSWORD`];

  if (!email && !password) return null;
  if (!email || !password) {
    throw new Error(`Cần cấu hình đồng thời ${prefix}_EMAIL và ${prefix}_PASSWORD cho ${label}.`);
  }

  return registerRequestSchema.parse({
    displayName: process.env[`${prefix}_DISPLAY_NAME`]?.trim() || fallbackName,
    email,
    password,
  });
}

async function ensureSeedUser(
  prefix: 'SEED_ADMIN' | 'SEED_CUSTOMER',
  role: UserRole,
  label: string,
  fallbackName: string,
) {
  const input = readUserSeedInput(prefix, label, fallbackName);
  if (!input) {
    console.log(`Chưa cấu hình ${prefix}_EMAIL và ${prefix}_PASSWORD; bỏ qua ${label}.`);
    return;
  }

  const passwordHash = await hashPassword(input.password);
  const seededUser = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        displayName: input.displayName,
        passwordHash,
        role,
        emailVerifiedAt: new Date(),
      },
      update: {
        displayName: input.displayName,
        passwordHash,
        role,
        active: true,
        emailVerifiedAt: new Date(),
      },
    });

    await transaction.session.deleteMany({ where: { userId: user.id } });
    return user;
  });

  console.log(`Đã tạo hoặc cập nhật ${label}: ${seededUser.email}`);
}

async function ensureAdmin() {
  await ensureSeedUser('SEED_ADMIN', UserRole.ADMIN, 'tài khoản quản trị', 'Quản trị viên');
}

async function ensureCustomer() {
  await ensureSeedUser('SEED_CUSTOMER', UserRole.CUSTOMER, 'tài khoản khách hàng', 'Khách hàng thử nghiệm');
}

type VariantSeed = {
  sku: string;
  label: string;
  packageQuantity: number;
  price: number;
  stockQuantity: number;
};

async function createIngredientWithProduct(
  slug: string,
  name: string,
  unit: MeasurementUnit,
  variants: VariantSeed[],
) {
  const ingredient = await prisma.ingredient.create({ data: { slug, name, unit } });
  const product = await prisma.product.create({
    data: {
      slug,
      name,
      description: `Nguyên liệu minh họa: ${name.toLocaleLowerCase('vi')}.`,
      kind: ProductKind.INGREDIENT,
      variants: {
        create: variants.map((variant) => ({ ...variant, unit })),
      },
    },
    include: { variants: true },
  });

  await prisma.inventoryMovement.createMany({
    data: product.variants
      .filter((variant) => variant.stockQuantity > 0)
      .map((variant) => ({
        productVariantId: variant.id,
        quantityDelta: variant.stockQuantity,
        stockBefore: 0,
        stockAfter: variant.stockQuantity,
        reason: 'INITIAL_STOCK' as const,
        note: 'Tồn kho ban đầu của dữ liệu minh họa.',
      })),
  });

  await prisma.ingredientVariant.createMany({
    data: product.variants.map((variant) => ({
      ingredientId: ingredient.id,
      productVariantId: variant.id,
    })),
  });

  return ingredient;
}

async function createToolWithProduct(slug: string, name: string, price: number) {
  const tool = await prisma.tool.create({ data: { slug, name } });
  const product = await prisma.product.create({
    data: {
      slug,
      name,
      description: `Dụng cụ minh họa: ${name.toLocaleLowerCase('vi')}.`,
      kind: ProductKind.TOOL,
      variants: {
        create: {
          sku: `TOOL-${slug.toUpperCase()}`,
          label: '1 cái',
          unit: MeasurementUnit.PIECE,
          packageQuantity: 1,
          price,
          stockQuantity: 20,
        },
      },
    },
    include: { variants: true },
  });

  const variant = product.variants[0];
  if (!variant) throw new Error(`Không tạo được biến thể dụng cụ ${slug}.`);

  await prisma.inventoryMovement.create({
    data: {
      productVariantId: variant.id,
      quantityDelta: variant.stockQuantity,
      stockBefore: 0,
      stockAfter: variant.stockQuantity,
      reason: 'INITIAL_STOCK',
      note: 'Tồn kho ban đầu của dữ liệu minh họa.',
    },
  });

  await prisma.toolVariant.create({
    data: { toolId: tool.id, productVariantId: variant.id },
  });

  return tool;
}

async function ensureRecipeSteps() {
  const stepSets = [
    {
      slug: 'basque-cheesecake',
      steps: [
        { stepNumber: 1, title: 'Làm nóng lò', instruction: 'Làm nóng lò ở 220°C. Lót hai lớp giấy nến vào khuôn, để giấy cao hơn thành khuôn.', temperatureC: 220 },
        { stepNumber: 2, title: 'Trộn phần kem', instruction: 'Đánh kem phô mai với đường đến khi mịn. Cho từng quả trứng vào, trộn vừa hòa quyện rồi thêm kem tươi.', durationMinutes: 10 },
        { stepNumber: 3, title: 'Nướng mặt cháy', instruction: 'Rót hỗn hợp vào khuôn và nướng đến khi mặt nâu sẫm, phần giữa vẫn còn rung nhẹ.', durationMinutes: 30, temperatureC: 220 },
        { stepNumber: 4, title: 'Để bánh ổn định', instruction: 'Để nguội trong khuôn rồi làm lạnh ít nhất 4 giờ trước khi cắt. Phần giữa sẽ đặc lại nhưng vẫn mềm.', durationMinutes: 240 },
      ],
    },
    {
      slug: 'cookie-socola',
      steps: [
        { stepNumber: 1, title: 'Chuẩn bị lò và bơ đường', instruction: 'Làm nóng lò ở 175°C, lót giấy nến cho khay. Đánh 165 g bơ mềm với 80 g đường trắng và 80 g đường nâu đến khi hỗn hợp hòa đều.', temperatureC: 175 },
        { stepNumber: 2, title: 'Trộn bột bánh', instruction: 'Cho lần lượt 2 quả trứng và 10 ml vani vào phần bơ. Rây 150 g bột mì với 3 g muối nở và 2 g muối, trộn vừa hết vệt bột; cuối cùng gấp 130 g sô-cô-la chip vào.' },
        { stepNumber: 3, title: 'Làm lạnh và chia bánh', instruction: 'Làm lạnh bột ít nhất 20–30 phút vì tỷ lệ bơ trong mẻ này khá cao. Chia thành khoảng 25–30 viên nhỏ, đặt cách xa nhau trên khay; thử nướng một viên trước nếu bột có dấu hiệu chảy rộng.', durationMinutes: 30 },
        { stepNumber: 4, title: 'Nướng và để ổn định', instruction: 'Nướng ở 175°C, bắt đầu kiểm tra sau 12 phút; lấy ra khi rìa vàng nhẹ còn giữa bánh mềm. Để trên khay 5–10 phút rồi chuyển lên giá. Số bánh thực tế phụ thuộc khối lượng mỗi viên và cần thử bếp để xác nhận.', durationMinutes: 15, temperatureC: 175 },
      ],
    },
    {
      slug: 'flan-caramel',
      steps: [
        { stepNumber: 1, title: 'Chuẩn bị cốc và lò', instruction: 'Làm nóng lò ở 160°C. Xếp 8–10 cốc sứ chịu nhiệt, mỗi cốc khoảng 100–120 ml, vào một khay sâu lòng.', temperatureC: 160 },
        { stepNumber: 2, title: 'Làm caramel', instruction: 'Trộn 70 g đường với một ít nước và nước cốt chanh trước khi đun. Đun trên lửa vừa, không khuấy khi đường đang chuyển màu. Khi caramel có màu hổ phách, nhấc khỏi bếp và chia ngay vào đáy cốc. Cẩn thận vì caramel rất nóng.' },
        { stepNumber: 3, title: 'Pha phần sữa trứng', instruction: 'Làm ấm sữa và kem tươi, không đun sôi. Khuấy nhẹ 5 quả trứng với 70 g đường còn lại và vani; rót sữa ấm từ từ vào, vừa rót vừa khuấy. Lọc hỗn hợp qua rây và hớt bọt.', durationMinutes: 10 },
        { stepNumber: 4, title: 'Nướng cách thủy', instruction: 'Rót phần sữa trứng vào cốc. Đổ nước nóng vào khay đến khoảng nửa chiều cao cốc, tránh để nước rơi vào flan. Nướng và bắt đầu kiểm tra từ phút 25; phần rìa se lại nhưng giữa cốc còn rung nhẹ.', durationMinutes: 35, temperatureC: 160 },
        { stepNumber: 5, title: 'Làm lạnh trước khi dùng', instruction: 'Nhấc cốc ra khỏi khay nước, để nguội rồi đậy kín và làm lạnh ít nhất 4 giờ. Dùng dao mảnh đi quanh mép cốc trước khi úp ra đĩa.', durationMinutes: 240 },
      ],
    },
    {
      slug: 'sponge-cake-3-trung',
      steps: [
        { stepNumber: 1, title: 'Chuẩn bị khuôn nhỏ', instruction: 'Làm nóng lò ở 160°C. Chuẩn bị khuôn tròn 15–18 cm; lót giấy ở đáy nhưng không phết dầu lên thành khuôn để bột có chỗ bám khi nở.', temperatureC: 160 },
        { stepNumber: 2, title: 'Trộn lòng đỏ', instruction: 'Tách 3 quả trứng. Khuấy lòng đỏ với dầu ăn và sữa cho đều, sau đó rây bột mì và bột ngô vào; trộn đến khi không còn bột khô.' },
        { stepNumber: 3, title: 'Đánh lòng trắng', instruction: 'Đánh lòng trắng với cream of tartar và muối đến khi nổi bọt mịn. Thêm đường làm 3 lần, tiếp tục đánh đến chóp gần cứng, bóng và không tách nước.' },
        { stepNumber: 4, title: 'Trộn và nướng', instruction: 'Trộn một phần lòng trắng vào hỗn hợp lòng đỏ cho nhẹ bột, rồi nhẹ tay gấp phần còn lại. Rót vào khuôn, gõ nhẹ một lần để vỡ bọt khí lớn và nướng đến khi mặt đàn hồi, que thử rút ra khô; bắt đầu kiểm tra từ phút 25.', durationMinutes: 35, temperatureC: 160 },
        { stepNumber: 5, title: 'Làm nguội', instruction: 'Lấy bánh ra và úp ngược khuôn trên giá thoáng cho đến khi nguội hẳn rồi mới gỡ bánh. Không tự tăng thời gian nướng theo số khẩu phần; nếu tăng mẻ, cần khuôn phù hợp.' },
      ],
    },
    {
      slug: 'sponge-cake-4-trung',
      steps: [
        { stepNumber: 1, title: 'Chuẩn bị khuôn', instruction: 'Làm nóng lò ở 160°C. Chuẩn bị khuôn tròn 18–21 cm; lót giấy ở đáy nhưng không phết dầu lên thành khuôn.', temperatureC: 160 },
        { stepNumber: 2, title: 'Trộn lòng đỏ', instruction: 'Tách 4 quả trứng. Khuấy lòng đỏ với dầu ăn và sữa cho đều, sau đó rây bột mì và bột ngô vào; trộn đến khi không còn bột khô.' },
        { stepNumber: 3, title: 'Đánh lòng trắng', instruction: 'Đánh lòng trắng với cream of tartar và muối đến khi nổi bọt mịn. Thêm đường làm 3 lần, tiếp tục đánh đến chóp gần cứng, bóng và không tách nước.' },
        { stepNumber: 4, title: 'Trộn và nướng', instruction: 'Trộn một phần lòng trắng vào hỗn hợp lòng đỏ cho nhẹ bột, rồi nhẹ tay gấp phần còn lại. Rót vào khuôn, gõ nhẹ một lần để vỡ bọt khí lớn và nướng đến khi mặt đàn hồi, que thử rút ra khô; bắt đầu kiểm tra từ phút 25.', durationMinutes: 35, temperatureC: 160 },
        { stepNumber: 5, title: 'Làm nguội', instruction: 'Úp ngược khuôn trên giá thoáng ngay khi lấy khỏi lò, chờ bánh nguội hoàn toàn rồi mới gỡ. Khuôn khác kích thước gợi ý có thể làm thay đổi thời gian nướng.' },
      ],
    },
    ...importedRecipeSeeds.filter((recipe) => recipe.steps).map((recipe) => ({
      slug: recipe.slug,
      steps: recipe.steps!,
    })),
  ];

  for (const stepSet of stepSets) {
    const recipe = await prisma.recipe.findUnique({ where: { slug: stepSet.slug }, select: { id: true } });
    if (!recipe) continue;
    await prisma.recipeStep.createMany({
      data: stepSet.steps.map((step) => ({ ...step, recipeId: recipe.id })),
      skipDuplicates: true,
    });
  }
}

async function ensureImportedRecipes() {
  const uniqueIngredients = new Map(
    importedRecipeSeeds.flatMap((recipe) => recipe.ingredients).map((ingredient) => [ingredient.slug, ingredient]),
  );
  const uniqueTools = new Map(
    importedRecipeSeeds.flatMap((recipe) => recipe.tools).map((tool) => [tool.slug, tool]),
  );

  const ingredients = await Promise.all(
    [...uniqueIngredients.values()].map((ingredient) =>
      prisma.ingredient.upsert({
        where: { slug: ingredient.slug },
        create: { slug: ingredient.slug, name: ingredient.name, unit: ingredient.unit },
        update: { name: ingredient.name, unit: ingredient.unit },
      }),
    ),
  );
  const tools = await Promise.all(
    [...uniqueTools.values()].map((tool) =>
      prisma.tool.upsert({
        where: { slug: tool.slug },
        create: { slug: tool.slug, name: tool.name },
        update: { name: tool.name },
      }),
    ),
  );
  const ingredientIds = new Map(ingredients.map((ingredient) => [ingredient.slug, ingredient.id]));
  const toolIds = new Map(tools.map((tool) => [tool.slug, tool.id]));

  const difficultyLabels = { EASY: 'dễ', MEDIUM: 'vừa', HARD: 'khó' } as const;
  const draftedStepSlugs = new Set(['flan-caramel', 'sponge-cake-3-trung', 'sponge-cake-4-trung']);
  const recipeOperations = importedRecipeSeeds.map((recipe) => {
    const ingredientsData = recipe.ingredients.map((ingredient, sortOrder) => ({
      ingredientId: ingredientIds.get(ingredient.slug)!,
      quantity: ingredient.quantity,
      note: ingredient.note,
      sortOrder,
    }));
    const toolsData = recipe.tools.map((tool, sortOrder) => ({
      toolId: toolIds.get(tool.slug)!,
      required: tool.required ?? true,
      sortOrder,
    }));
    const summary = `Định lượng cho ${recipe.sourceYield}; mức ${difficultyLabels[recipe.difficulty]}. Danh sách mua được ghép theo quy cách hiện có.`;
    const sharedData = {
      title: recipe.title,
      summary,
      category: recipe.category,
      baseServings: recipe.baseServings,
      yieldUnit: recipe.yieldUnit,
      prepMinutes: recipe.prepMinutes,
      bakeMinutes: recipe.bakeMinutes,
      temperatureC: recipe.steps?.find((step) => step.temperatureC)?.temperatureC ?? (draftedStepSlugs.has(recipe.slug) ? 160 : null),
      difficulty: recipe.difficulty,
      published: true,
    };

    return prisma.recipe.upsert({
      where: { slug: recipe.slug },
      create: {
        slug: recipe.slug,
        ...sharedData,
        story: recipe.story,
        imageUrl: recipe.imageUrl,
        ingredients: { create: ingredientsData },
        tools: { create: toolsData },
      },
      update: {
        ...sharedData,
        ingredients: { deleteMany: {}, create: ingredientsData },
        tools: { deleteMany: {}, create: toolsData },
      },
    });
  });

  await prisma.$transaction(recipeOperations);
  console.log(`Đã nhập hoặc cập nhật ${importedRecipeSeeds.length} biến thể công thức từ tài liệu nguyên liệu.`);
}

async function main() {
  await ensureAdmin();
  await ensureCustomer();

  if ((await prisma.recipe.count()) > 0) {
    await ensureImportedRecipes();
    await ensureRecipeSteps();
    console.log('Database đã có dữ liệu; đã đồng bộ tài khoản, công thức và bước làm còn thiếu.');
    return;
  }

  const [creamCheese, sugar, egg, cream, flour, butter, chocolate] = await Promise.all([
    createIngredientWithProduct('cream-cheese', 'Kem phô mai', MeasurementUnit.GRAM, [
      { sku: 'CC-200', label: 'Hộp 200 g', packageQuantity: 200, price: 45_000, stockQuantity: 30 },
      { sku: 'CC-500', label: 'Hộp 500 g', packageQuantity: 500, price: 98_000, stockQuantity: 18 },
    ]),
    createIngredientWithProduct('duong-cat', 'Đường cát', MeasurementUnit.GRAM, [
      { sku: 'SUGAR-500', label: 'Túi 500 g', packageQuantity: 500, price: 19_000, stockQuantity: 40 },
      { sku: 'SUGAR-1000', label: 'Túi 1 kg', packageQuantity: 1000, price: 34_000, stockQuantity: 25 },
    ]),
    createIngredientWithProduct('trung-ga', 'Trứng gà', MeasurementUnit.PIECE, [
      { sku: 'EGG-6', label: 'Vỉ 6 quả', packageQuantity: 6, price: 24_000, stockQuantity: 24 },
      { sku: 'EGG-10', label: 'Vỉ 10 quả', packageQuantity: 10, price: 37_000, stockQuantity: 16 },
    ]),
    createIngredientWithProduct('kem-tuoi', 'Kem tươi', MeasurementUnit.MILLILITER, [
      { sku: 'CREAM-250', label: 'Hộp 250 ml', packageQuantity: 250, price: 62_000, stockQuantity: 14 },
      { sku: 'CREAM-1000', label: 'Hộp 1 lít', packageQuantity: 1000, price: 189_000, stockQuantity: 8 },
    ]),
    createIngredientWithProduct('bot-mi', 'Bột mì đa dụng', MeasurementUnit.GRAM, [
      { sku: 'FLOUR-500', label: 'Túi 500 g', packageQuantity: 500, price: 22_000, stockQuantity: 40 },
      { sku: 'FLOUR-1000', label: 'Túi 1 kg', packageQuantity: 1000, price: 39_000, stockQuantity: 25 },
    ]),
    createIngredientWithProduct('bo-lat', 'Bơ lạt', MeasurementUnit.GRAM, [
      { sku: 'BUTTER-200', label: 'Gói 200 g', packageQuantity: 200, price: 56_000, stockQuantity: 22 },
      { sku: 'BUTTER-500', label: 'Gói 500 g', packageQuantity: 500, price: 129_000, stockQuantity: 10 },
    ]),
    createIngredientWithProduct('socola-den', 'Sô-cô-la đen', MeasurementUnit.GRAM, [
      { sku: 'CHOCO-100', label: 'Thanh 100 g', packageQuantity: 100, price: 39_000, stockQuantity: 30 },
      { sku: 'CHOCO-250', label: 'Túi 250 g', packageQuantity: 250, price: 89_000, stockQuantity: 14 },
    ]),
  ]);

  const [roundPan, whisk, bakingTray] = await Promise.all([
    createToolWithProduct('khuon-tron-16', 'Khuôn tròn 16 cm', 115_000),
    createToolWithProduct('phoi-long', 'Phới lồng', 48_000),
    createToolWithProduct('khay-nuong', 'Khay nướng', 135_000),
  ]);

  await prisma.recipe.create({
    data: {
      slug: 'basque-cheesecake',
      title: 'Basque cheesecake cháy cạnh',
      imageUrl: '/images/recipes/basque-cheesecake.png',
      summary: 'Mặt bánh nâu sẫm, bên trong mềm mượt và có vị kem phô mai rõ ràng.',
      story: 'Chiếc bánh nổi tiếng từ khu phố cổ San Sebastián không cần đế bánh quy. Nhiệt cao tạo lớp mặt cháy thơm, trong khi phần giữa vẫn mềm và rung nhẹ khi vừa ra lò.',
      baseServings: 4,
      prepMinutes: 20,
      bakeMinutes: 30,
      temperatureC: 220,
      difficulty: 'EASY',
      published: true,
      ingredients: {
        create: [
          { ingredientId: creamCheese.id, quantity: 400, sortOrder: 0 },
          { ingredientId: sugar.id, quantity: 100, sortOrder: 1 },
          { ingredientId: egg.id, quantity: 3, sortOrder: 2 },
          { ingredientId: cream.id, quantity: 200, sortOrder: 3 },
        ],
      },
      tools: {
        create: [
          { toolId: roundPan.id, sortOrder: 0 },
          { toolId: whisk.id, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      slug: 'cookie-socola',
      title: 'Cookie sô-cô-la mềm giữa',
      summary: 'Rìa giòn nhẹ, ruột mềm và những mảng sô-cô-la còn tan khi bánh ấm.',
      story: importedRecipeSeeds.find((recipe) => recipe.slug === 'cookie-socola')!.story,
      baseServings: 6,
      prepMinutes: 25,
      bakeMinutes: 12,
      temperatureC: 175,
      difficulty: 'MEDIUM',
      published: true,
      ingredients: {
        create: [
          { ingredientId: flour.id, quantity: 180, sortOrder: 0 },
          { ingredientId: butter.id, quantity: 110, sortOrder: 1 },
          { ingredientId: sugar.id, quantity: 90, sortOrder: 2 },
          { ingredientId: egg.id, quantity: 1, sortOrder: 3 },
          { ingredientId: chocolate.id, quantity: 120, sortOrder: 4 },
        ],
      },
      tools: {
        create: [
          { toolId: bakingTray.id, sortOrder: 0 },
          { toolId: whisk.id, required: false, sortOrder: 1 },
        ],
      },
    },
  });

  await ensureImportedRecipes();
  await ensureRecipeSteps();

  console.log('Đã tạo danh mục sản phẩm minh họa và đồng bộ bộ công thức đầu vào.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
