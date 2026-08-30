import type { AuthUser } from '@/lib/store';
import {
  createUser,
  delay,
  findByEmail,
  publicUser,
  setSession,
  tokenOwnerId,
  verifyPassword,
} from '@/lib/store';
import { uid as genUid } from '@/lib/store';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  country: string;
}

export class AuthError extends Error {}

export async function login(input: LoginInput): Promise<AuthUser> {
  await delay(380);
  const user = findByEmail(input.email);
  if (!user) throw new AuthError('No account found with that email.');
  if (user.disabled) throw new AuthError('This account has been disabled.');
  if (!verifyPassword(user, input.password)) throw new AuthError('Incorrect password.');
  const token = `uid:${user.id}`;
  setSession({ userId: user.id, token });
  return publicUser(user, token);
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  await delay(420);
  const email = input.email.trim().toLowerCase();
  if (findByEmail(email)) throw new AuthError('An account with that email already exists.');
  if (input.password.length < 6) throw new AuthError('Password must be at least 6 characters.');
  const user = createUser(input);
  const token = `uid:${user.id}`;
  setSession({ userId: user.id, token });
  return publicUser(user, token);
}

export async function logout(): Promise<void> {
  await delay(80);
  setSession(null);
}

export function forgotPassword(_email: string): Promise<void> {
  // Demo flow: in production this would dispatch a secure reset email via the
  // backend. Here we only acknowledge the request to avoid leaking accounts.
  return delay(420).then(() => undefined);
}

export function currentUserFromSession(): { userId: string } | null {
  const id = tokenOwnerId();
  return id ? { userId: id } : null;
}

export { genUid };