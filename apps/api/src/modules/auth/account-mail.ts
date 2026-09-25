import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/app-error.js';

export function requireMailConfiguration() {
  if (!env.smtp || !env.publicWebUrl) {
    throw new AppError(503, 'MAIL_NOT_CONFIGURED', 'Dịch vụ gửi thư chưa được cấu hình.');
  }
  return { smtp: env.smtp, webUrl: env.publicWebUrl };
}

function createTransport(smtp: NonNullable<typeof env.smtp>) {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: env.nodeEnv === 'production' && !smtp.secure,
    tls: { minVersion: 'TLSv1.2' },
    auth: smtp.user && smtp.password ? { user: smtp.user, pass: smtp.password } : undefined,
  });
}

export async function sendAccountMail(input: {
  to: string;
  kind: 'verify' | 'reset';
  token: string;
}) {
  const { smtp, webUrl } = requireMailConfiguration();
  const url = buildAccountLink(webUrl, input.kind, input.token);
  const title = input.kind === 'verify' ? 'Xác minh email Một Mẻ Bánh' : 'Đặt lại mật khẩu Một Mẻ Bánh';
  const text = input.kind === 'verify'
    ? `Để hoàn tất đăng ký, mở liên kết sau trong 24 giờ:\n${url}\nNếu bạn không đăng ký, hãy bỏ qua thư này.`
    : `Để đặt lại mật khẩu, mở liên kết sau trong 30 phút:\n${url}\nNếu bạn không yêu cầu, hãy bỏ qua thư này.`;
  await createTransport(smtp).sendMail({ from: smtp.from, to: input.to, subject: title, text });
}

export function buildAccountLink(webUrl: string, kind: 'verify' | 'reset', token: string) {
  const path = kind === 'verify' ? '/xac-minh-email' : '/dat-lai-mat-khau';
  const url = new URL(path, webUrl);
  // Fragment không được gửi trong HTTP request tới Vercel; UI xóa khỏi thanh địa chỉ sau khi đọc.
  url.hash = new URLSearchParams({ token }).toString();
  return url.toString();
}

export async function sendPasswordChangedNotice(to: string) {
  const { smtp } = requireMailConfiguration();
  await createTransport(smtp).sendMail({
    from: smtp.from,
    to,
    subject: 'Mật khẩu Một Mẻ Bánh vừa được thay đổi',
    text: 'Mật khẩu tài khoản Một Mẻ Bánh vừa được thay đổi. Nếu bạn không thực hiện, hãy liên hệ người quản trị ngay. Không trả lời thư này.',
  });
}
