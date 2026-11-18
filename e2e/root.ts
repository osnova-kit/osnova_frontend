export const root = {
  email: process.env.E2E_EMAIL ?? '',
  password: process.env.E2E_PASSWORD ?? '',
  state: 'e2e/.auth/root.json',
};

export const unique = (label: string) => `${label} ${Date.now()}`;
