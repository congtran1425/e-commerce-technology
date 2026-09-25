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
      emailVerifiedAt: true,
    },
  });
}

export function findUserByEmail(email: string) {
  return database.user.findUnique({
    where: { email },
    select: { id: true, email: true, active: true, emailVerifiedAt: true },
  });
}

export function createUnverifiedCustomer(input: {
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

    await transaction.accountToken.create({
      data: {
        userId: user.id,
        purpose: 'VERIFY_EMAIL',
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
      user: { active: true, emailVerifiedAt: { not: null } },
    },
    select: { user: { select: publicUserSelect } },
  });

  return session?.user ?? null;
}

export async function deleteSessionByHash(tokenHash: string) {
  await database.session.deleteMany({ where: { tokenHash } });
}

export async function replaceAccountToken(input: {
  userId: bigint;
  purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD';
  tokenHash: string;
  expiresAt: Date;
}) {
  await database.accountToken.upsert({
    where: { userId_purpose: { userId: input.userId, purpose: input.purpose } },
    create: input,
    update: { tokenHash: input.tokenHash, expiresAt: input.expiresAt, createdAt: new Date() },
  });
}

export async function consumeVerificationToken(tokenHash: string) {
  return database.$transaction(async (transaction) => {
    const token = await transaction.accountToken.findUnique({ where: { tokenHash } });
    if (!token || token.purpose !== 'VERIFY_EMAIL' || token.expiresAt <= new Date()) return false;
    const consumed = await transaction.accountToken.deleteMany({ where: { id: token.id, tokenHash } });
    if (consumed.count !== 1) return false;
    await transaction.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } });
    return true;
  });
}

export async function consumePasswordResetToken(tokenHash: string, passwordHash: string) {
  return database.$transaction(async (transaction) => {
    const token = await transaction.accountToken.findUnique({ where: { tokenHash } });
    if (!token || token.purpose !== 'RESET_PASSWORD' || token.expiresAt <= new Date()) return null;
    const consumed = await transaction.accountToken.deleteMany({ where: { id: token.id, tokenHash } });
    if (consumed.count !== 1) return null;
    const user = await transaction.user.update({
      where: { id: token.userId },
      data: { passwordHash },
      select: { email: true },
    });
    await transaction.session.deleteMany({ where: { userId: token.userId } });
    await transaction.accountToken.deleteMany({ where: { userId: token.userId } });
    return user.email;
  });
}
