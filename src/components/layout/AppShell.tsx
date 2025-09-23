import { useEffect, useMemo, useState } from 'react';
import { Outlet, useMatches } from 'react-router-dom';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const matches = useMatches();

  const pageTitle = useMemo(() => {
    const matchWithTitle = [...matches]
      .reverse()
      .find((match) => typeof match.handle === 'object' && match.handle !== null && 'title' in match.handle);

    if (matchWithTitle && typeof matchWithTitle.handle === 'object' && matchWithTitle.handle !== null) {
      const typedHandle = matchWithTitle.handle as { title?: string };
      return typedHandle.title ?? 'Dashboard';
    }

    return 'Dashboard';
  }, [matches]);

  useEffect(() => {
    document.title = `${pageTitle} | School Control Center`;
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:pl-72">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col">
        <Header title={pageTitle} onToggleSidebar={() => setSidebarOpen((state) => !state)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
