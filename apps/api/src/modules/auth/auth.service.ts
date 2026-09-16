import { env } from '../../config/env.js';
import { AppError } from '../../shared/app-error.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import {
  createCustomerWithSession,
  createSessionForUser,
  deleteSessionByHash,
  findActiveUserByEmail,
  findUserByEmail,
  findUserBySessionHash,
  type PublicUserRecord,
} from './auth.repository.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  createSessionToken,
  hashSessionToken,
  isSessionToken,
} from './session-token.js';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1_000;
const DUMMY_PASSWORD_HASH = '$argon2id$v=19$m=19456,p=1,t=2$T/BILiCItNTz9CKMEZQnZA$94Uqt4sVQxIMQPtDvd2Nl5eDVTWDp2cIc81ULZUim6o';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
};

type AuthResult = {
  user: AuthUser;
  sessionToken: string;
};

function toAuthUser(user: PublicUserRecord): AuthUser {
  return {
    id: user.id.toString(),
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    role: user.role,
  };
}

function createExpiryDate() {
  return new Date(Date.now() + env.sessionTtlDays * DAY_IN_MILLISECONDS);
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === 'P2002';
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  if (await findUserByEmail(input.email)) {
    throw new AppError(409, 'EMAIL_ALREADY_USED', 'Email này đã được dùng để đăng ký.');
  }

  const [passwordHash, sessionToken] = await Promise.all([
    hashPassword(input.password),
    Promise.resolve(createSessionToken()),
  ]);

  try {
    const user = await createCustomerWithSession({
      displayName: input.displayName,
      email: input.email,
      passwordHash,
      tokenHash: hashSessionToken(sessionToken),
      expiresAt: createExpiryDate(),
    });

    return { user: toAuthUser(user), sessionToken };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(409, 'EMAIL_ALREADY_USED', 'Email này đã được dùng để đăng ký.');
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await findActiveUserByEmail(input.email);
  const passwordMatches = await verifyPassword(
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    input.password,
  );

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
  }

  const sessionToken = createSessionToken();
  await createSessionForUser({
    userId: user.id,
    tokenHash: hashSessionToken(sessionToken),
    expiresAt: createExpiryDate(),
  });

  return { user: toAuthUser(user), sessionToken };
}

export async function getUserFromSessionToken(sessionToken: string) {
  if (!isSessionToken(sessionToken)) return null;
  const user = await findUserBySessionHash(hashSessionToken(sessionToken));
  return user ? toAuthUser(user) : null;
}

export async function logout(sessionToken: string | null) {
  if (!sessionToken || !isSessionToken(sessionToken)) return;
  await deleteSessionByHash(hashSessionToken(sessionToken));
}
