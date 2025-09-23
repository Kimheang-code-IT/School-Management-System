import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';

import { RouteLoader } from '@/components/layout/RouteLoader';
import { router } from '@/routes/router';

const App = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
