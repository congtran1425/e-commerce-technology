const MONEY_SCALE = 100n;

export function decimalToMinorUnits(value: string) {
  const [wholePart, decimalPart = ''] = value.split('.');
  if (!wholePart || !/^\d+$/.test(wholePart) || !/^\d*$/.test(decimalPart)) {
    throw new Error(`Giá trị tiền không hợp lệ: ${value}`);
  }

  return BigInt(wholePart) * MONEY_SCALE + BigInt(`${decimalPart}00`.slice(0, 2));
}

export function minorUnitsToDecimal(value: bigint) {
  return `${value / MONEY_SCALE}.${(value % MONEY_SCALE).toString().padStart(2, '0')}`;
}

export function minorUnitsToWholeVnd(value: bigint) {
  if (value <= 0n || value % MONEY_SCALE !== 0n) {
    throw new Error('ZaloPay chỉ nhận tổng tiền VND dương, không có phần thập phân.');
  }

  const amount = value / MONEY_SCALE;
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Tổng tiền vượt quá phạm vi số nguyên an toàn.');
  }
  return Number(amount);
}
