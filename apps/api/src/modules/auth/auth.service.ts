import { env } from '../../config/env.js';
import { AppError } from '../../shared/app-error.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import { requireMailConfiguration, sendAccountMail, sendPasswordChangedNotice } from './account-mail.js';
import { createAccountToken, hashAccountToken, isAccountToken } from './account-token.js';
import {
  consumePasswordResetToken,
  consumeVerificationToken,
  createUnverifiedCustomer,
  createSessionForUser,
  deleteSessionByHash,
  findActiveUserByEmail,
  findUserByEmail,
  findUserBySessionHash,
  replaceAccountToken,
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

export async function register(input: RegisterInput): Promise<void> {
  requireMailConfiguration();
  if (await findUserByEmail(input.email)) {
    return;
  }

  const [passwordHash, accountToken] = await Promise.all([
    hashPassword(input.password),
    Promise.resolve(createAccountToken()),
  ]);

  try {
    await createUnverifiedCustomer({
      displayName: input.displayName,
      email: input.email,
      passwordHash,
      tokenHash: hashAccountToken(accountToken),
      expiresAt: new Date(Date.now() + DAY_IN_MILLISECONDS),
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return;
    }
    throw error;
  }
  await sendAccountMail({ to: input.email, kind: 'verify', token: accountToken });
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

  if (!user.emailVerifiedAt) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Vui lòng xác minh email trước khi đăng nhập.');
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

async function issueAccountToken(email: string, purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD') {
  requireMailConfiguration();
  const user = await findUserByEmail(email);
  if (!user?.active || (purpose === 'VERIFY_EMAIL' ? user.emailVerifiedAt : !user.emailVerifiedAt)) return;
  const token = createAccountToken();
  await replaceAccountToken({
    userId: user.id,
    purpose,
    tokenHash: hashAccountToken(token),
    expiresAt: new Date(Date.now() + (purpose === 'VERIFY_EMAIL' ? DAY_IN_MILLISECONDS : 30 * 60 * 1_000)),
  });
  try {
    await sendAccountMail({ to: user.email, kind: purpose === 'VERIFY_EMAIL' ? 'verify' : 'reset', token });
  } catch {
    // Giữ phản hồi giống email không tồn tại; người dùng có thể thử gửi lại sau.
    console.error('Không thể gửi thư xác minh hoặc đặt lại mật khẩu.');
  }
}

export async function resendVerification(email: string) {
  await issueAccountToken(email, 'VERIFY_EMAIL');
}

export async function forgotPassword(email: string) {
  await issueAccountToken(email, 'RESET_PASSWORD');
}

export async function verifyEmail(token: string) {
  if (!isAccountToken(token) || !(await consumeVerificationToken(hashAccountToken(token)))) {
    throw new AppError(400, 'INVALID_ACCOUNT_TOKEN', 'Liên kết không hợp lệ hoặc đã hết hạn.');
  }
}

export async function resetPassword(token: string, password: string) {
  if (!isAccountToken(token)) {
    throw new AppError(400, 'INVALID_ACCOUNT_TOKEN', 'Liên kết không hợp lệ hoặc đã hết hạn.');
  }
  const email = await consumePasswordResetToken(hashAccountToken(token), await hashPassword(password));
  if (!email) throw new AppError(400, 'INVALID_ACCOUNT_TOKEN', 'Liên kết không hợp lệ hoặc đã hết hạn.');
  try {
    await sendPasswordChangedNotice(email);
  } catch {
    // Đổi mật khẩu đã commit; lỗi gửi thông báo không được làm khách tưởng thao tác thất bại.
    console.error('Không thể gửi thông báo đổi mật khẩu.');
  }
}
