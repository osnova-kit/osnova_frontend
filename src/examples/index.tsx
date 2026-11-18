import type { RouteObject } from 'react-router-dom';

import { lazyElement } from '../routes/lazy';

export const exampleRoutes: RouteObject[] = [
  { path: 'examples', element: lazyElement(() => import('./ExamplesIndex')) },
  {
    path: 'examples/data',
    element: lazyElement(() => import('./data/ExampleData')),
  },
  {
    path: 'examples/landing',
    element: lazyElement(() => import('./landing/ExampleLanding')),
  },
  {
    path: 'examples/contact',
    element: lazyElement(() => import('./contact/Contact')),
  },
];
