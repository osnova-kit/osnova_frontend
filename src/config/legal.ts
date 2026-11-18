export interface LegalConfig {
  /** Company or person responsible for the site and personal data */
  owner: string;
  email: string;
  address: string;
  /** Date the documents were last changed, YYYY-MM-DD */
  updated: string;
}

export const legal: LegalConfig = {
  owner: '[Company name]',
  email: '[privacy@example.com]',
  address: '[Postal address]',
  updated: '2026-11-07',
};

export const isLegalConfigured = (): boolean =>
  !Object.values(legal).some((value) => value.startsWith('['));
