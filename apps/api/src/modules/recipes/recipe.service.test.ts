import { beforeEach, describe, expect, it, vi } from 'vitest';

const repositoryMocks = vi.hoisted(() => ({
  findPublishedRecipeBySlug: vi.fn(),
  findPublishedRecipes: vi.fn(),
}));

vi.mock('./recipe.repository.js', () => repositoryMocks);

import { listRecipes } from './recipe.service.js';

describe('listRecipes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('bổ sung nhãn tiếng Việt và tổng thời gian cho danh sách công thức', async () => {
    repositoryMocks.findPublishedRecipes.mockResolvedValue([
      {
        slug: 'banh-quy-bo',
        title: 'Bánh quy bơ',
        summary: 'Một mẻ bánh quy dễ bắt đầu.',
        imageUrl: '/images/recipes/thumbnails/cranberry-butter-cookies.png',
        baseServings: 24,
        yieldUnit: 'PIECE',
        category: 'COOKIE',
        prepMinutes: 20,
        bakeMinutes: 15,
        difficulty: 'EASY',
      },
    ]);

    await expect(listRecipes()).resolves.toEqual([
      expect.objectContaining({
        categoryLabel: 'Bánh quy',
        difficultyLabel: 'Dễ',
        imageUrl: '/images/recipes/thumbnails/cranberry-butter-cookies.png',
        totalMinutes: 35,
        yieldUnitLabel: 'cái',
      }),
    ]);
  });
});
