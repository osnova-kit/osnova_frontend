import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: process.env.OPENAPI_INPUT ?? '../osnova_backend/openapi.json',
  output: { path: 'src/api/generated', postProcess: [] },
  plugins: ['@hey-api/typescript'],
});
