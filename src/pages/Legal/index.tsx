import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../../routes/lazy';
import type { LegalDocument } from './LegalPage';

const legalElement = (document: LegalDocument) =>
  lazyElement(() =>
    import('./LegalPage').then(({ default: LegalPage }) => ({
      default: () => <LegalPage document={document} />,
    })),
  );

const DOCUMENTS: LegalDocument[] = ['privacy', 'terms', 'cookies'];

export const legalRoutes: RouteObject[] = DOCUMENTS.map((document) => ({
  path: document,
  element: legalElement(document),
}));

export const LEGAL_LINKS = DOCUMENTS.map((document) => ({ path: `/${document}`, document }));
