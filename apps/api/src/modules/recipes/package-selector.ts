export type PackageCandidate = {
  id: string;
  label: string;
  packageQuantity: string;
  price: string;
  stockQuantity: number;
};

export type SelectedPackage = PackageCandidate & {
  count: number;
};

export type PackageSelection = {
  packages: SelectedPackage[];
  suppliedQuantity: string;
  surplusQuantity: string;
  totalPrice: string;
  totalPacks: number;
};

const QUANTITY_SCALE = 1_000;
const MONEY_SCALE = 100;

function toScaledInteger(value: string, scale: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Giá trị số không hợp lệ: ${value}`);
  }

  return Math.round(parsed * scale);
}

function fromScaledInteger(value: number, scale: number) {
  return (value / scale).toFixed(scale === MONEY_SCALE ? 2 : 3);
}

type EvaluatedSelection = {
  counts: number[];
  supplied: number;
  totalPrice: number;
  totalPacks: number;
};

function isBetter(
  next: EvaluatedSelection,
  current: EvaluatedSelection | undefined,
  required: number,
) {
  if (!current) return true;

  const nextSurplus = next.supplied - required;
  const currentSurplus = current.supplied - required;

  return (
    next.totalPrice < current.totalPrice ||
    (next.totalPrice === current.totalPrice && nextSurplus < currentSurplus) ||
    (next.totalPrice === current.totalPrice &&
      nextSurplus === currentSurplus &&
      next.totalPacks < current.totalPacks)
  );
}

export function selectPackages(
  requiredQuantity: string,
  candidates: PackageCandidate[],
): PackageSelection | null {
  const required = toScaledInteger(requiredQuantity, QUANTITY_SCALE);
  const available = candidates.filter(
    (candidate) => candidate.stockQuantity > 0 && Number(candidate.packageQuantity) > 0,
  );

  if (required === 0) {
    return {
      packages: [],
      suppliedQuantity: '0.000',
      surplusQuantity: '0.000',
      totalPrice: '0.00',
      totalPacks: 0,
    };
  }

  if (available.length === 0) return null;

  const quantities = available.map((candidate) =>
    toScaledInteger(candidate.packageQuantity, QUANTITY_SCALE),
  );
  const prices = available.map((candidate) => toScaledInteger(candidate.price, MONEY_SCALE));
  let best: EvaluatedSelection | undefined;

  function search(index: number, counts: number[], supplied: number, totalPrice: number, totalPacks: number) {
    if (index === available.length) {
      if (supplied >= required) {
        const next = { counts: [...counts], supplied, totalPrice, totalPacks };
        if (isBetter(next, best, required)) best = next;
      }
      return;
    }

    if (best && totalPrice > best.totalPrice) return;

    const quantity = quantities[index];
    const price = prices[index];
    const candidate = available[index];

    if (quantity === undefined || price === undefined || !candidate) return;

    const packsNeeded = Math.ceil(Math.max(0, required - supplied) / quantity);
    const maxCount = Math.min(candidate.stockQuantity, packsNeeded + 1, 1_000);

    for (let count = 0; count <= maxCount; count += 1) {
      counts[index] = count;
      search(
        index + 1,
        counts,
        supplied + quantity * count,
        totalPrice + price * count,
        totalPacks + count,
      );
    }
  }

  search(0, [], 0, 0, 0);

  if (!best) return null;

  const resolved = best as EvaluatedSelection;

  return {
    packages: available.flatMap((candidate, index) => {
      const count = resolved.counts[index] ?? 0;
      return count > 0 ? [{ ...candidate, count }] : [];
    }),
    suppliedQuantity: fromScaledInteger(resolved.supplied, QUANTITY_SCALE),
    surplusQuantity: fromScaledInteger(resolved.supplied - required, QUANTITY_SCALE),
    totalPrice: fromScaledInteger(resolved.totalPrice, MONEY_SCALE),
    totalPacks: resolved.totalPacks,
  };
}

