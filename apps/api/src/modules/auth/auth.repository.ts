import { database } from '../../config/database.js';

const publicUserSelect = {
  id: true,
  email: true,
  displayName: true,
  phone: true,
  role: true,
} as const;

export type PublicUserRecord = {
  id: bigint;
  email: string;
  displayName: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
};

export function findActiveUserByEmail(email: string) {
  return database.user.findFirst({
    where: { email, active: true },
    select: {
      ...publicUserSelect,
      passwordHash: true,
    },
  });
}

export function findUserByEmail(email: string) {
  return database.user.findUnique({
    where: { email },
    select: { id: true },
  });
}

export function createCustomerWithSession(input: {
  displayName: string;
  email: string;
  passwordHash: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return database.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        displayName: input.displayName,
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'CUSTOMER',
      },
      select: publicUserSelect,
    });

    await transaction.session.create({
      data: {
        userId: user.id,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });

    return user;
  });
}

export async function createSessionForUser(input: {
  userId: bigint;
  tokenHash: string;
  expiresAt: Date;
}) {
  await database.session.create({ data: input });
}

export async function findUserBySessionHash(tokenHash: string) {
  const session = await database.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
      user: { active: true },
    },
    select: { user: { select: publicUserSelect } },
  });

  return session?.user ?? null;
}

export async function deleteSessionByHash(tokenHash: string) {
  await database.session.deleteMany({ where: { tokenHash } });
}
