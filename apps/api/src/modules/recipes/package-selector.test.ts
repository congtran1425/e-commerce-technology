import { describe, expect, it } from 'vitest';
import { selectPackages, type PackageCandidate } from './package-selector.js';

const candidates: PackageCandidate[] = [
  { id: 'small', label: 'Gói 200 g', packageQuantity: '200', price: '45000', stockQuantity: 10 },
  { id: 'large', label: 'Gói 500 g', packageQuantity: '500', price: '98000', stockQuantity: 10 },
];

describe('selectPackages', () => {
  it('ưu tiên tổng giá thấp nhất sau khi đủ định lượng', () => {
    const result = selectPackages('500', candidates);

    expect(result?.packages).toEqual([{ ...candidates[1], count: 1 }]);
    expect(result?.totalPrice).toBe('98000.00');
  });

  it('ưu tiên phần dư thấp hơn khi tổng giá bằng nhau', () => {
    const result = selectPackages('350', [
      { id: 'a', label: 'Gói 200 g', packageQuantity: '200', price: '30000', stockQuantity: 10 },
      { id: 'b', label: 'Gói 400 g', packageQuantity: '400', price: '60000', stockQuantity: 10 },
      { id: 'c', label: 'Gói 500 g', packageQuantity: '500', price: '60000', stockQuantity: 10 },
    ]);

    expect(result?.packages).toEqual([
      expect.objectContaining({ id: 'b', count: 1 }),
    ]);
  });

  it('không đề xuất khi tồn kho không thể đáp ứng', () => {
    expect(selectPackages('1000', [{ ...candidates[0]!, stockQuantity: 2 }])).toBeNull();
  });

  it('ưu tiên ít gói hơn khi tổng giá và phần dư bằng nhau', () => {
    const result = selectPackages('400', [
      { id: 'a', label: 'Gói 200 g', packageQuantity: '200', price: '30000', stockQuantity: 10 },
      { id: 'b', label: 'Gói 400 g', packageQuantity: '400', price: '60000', stockQuantity: 10 },
    ]);

    expect(result?.packages).toEqual([expect.objectContaining({ id: 'b', count: 1 })]);
  });
});
