export type AuthRole = 'CUSTOMER' | 'ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  role: AuthRole;
};

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  displayName: string;
};
