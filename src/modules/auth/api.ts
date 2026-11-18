import api from '../../api/axios';
import { captchaHeaders } from '../../api/captcha';
import type {
  AccountDelete,
  EmailChange,
  OAuth2AuthorizeResponse,
  PasswordChange,
  UserRead,
} from '../../api/generated';

export const getCurrentUser = async (): Promise<UserRead> => {
  const response = await api.get<UserRead>('/auth/users/me', { skipAuthRedirect: true });
  return response.data;
};

export async function login(email: string, password: string) {
  const form = new URLSearchParams({ username: email, password });
  await api.post('/auth/login', form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function register(email: string, password: string, captchaToken?: string | null) {
  await api.post('/auth/register', { email, password }, { headers: captchaHeaders(captchaToken) });
}

export async function verifyEmail(token: string): Promise<UserRead> {
  const response = await api.post<UserRead>('/auth/verify', { token }, { skipAuthRedirect: true });
  return response.data;
}

/** Sends a new confirmation link (the answer is the same for unknown addresses). */
export async function requestVerification(email: string) {
  await api.post('/auth/request-verify-token', { email }, { skipAuthRedirect: true });
}

/** Sends a password reset link (the answer is the same for unknown addresses). */
export async function forgotPassword(email: string) {
  await api.post('/auth/forgot-password', { email }, { skipAuthRedirect: true });
}

export async function resetPassword(token: string, password: string) {
  await api.post('/auth/reset-password', { token, password }, { skipAuthRedirect: true });
}

/** Where to send the browser to sign in with a provider (also sets the CSRF cookie). */
export async function getOAuthUrl(provider: string): Promise<string> {
  const response = await api.get<OAuth2AuthorizeResponse>(`/auth/${provider}/authorize`);
  return response.data.authorization_url;
}

export async function finishOAuth(provider: string, search: string) {
  await api.get(`/auth/${provider}/callback${search}`, { skipAuthRedirect: true });
}

export async function updateName(name: string): Promise<UserRead> {
  const response = await api.patch<UserRead>('/auth/users/me', { name });
  return response.data;
}

export async function updateLanguage(language: string): Promise<UserRead> {
  const response = await api.patch<UserRead>('/auth/users/me', { language });
  return response.data;
}

/** Other sessions end; this browser gets a new cookie. */
export async function changePassword(data: PasswordChange) {
  await api.post('/auth/me/password', data, { skipAuthRedirect: true });
}

export async function changeEmail(data: EmailChange): Promise<UserRead> {
  const response = await api.post<UserRead>('/auth/me/email', data, { skipAuthRedirect: true });
  return response.data;
}

export async function signOutEverywhere() {
  await api.post('/auth/me/sign-out-everywhere');
}

export async function deleteAccount(data: AccountDelete) {
  await api.delete('/auth/me', { data, skipAuthRedirect: true });
}
