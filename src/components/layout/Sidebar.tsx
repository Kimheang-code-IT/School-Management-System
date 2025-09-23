import { Fragment, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';

import { useAuth } from '@/features/auth';
import { cn } from '@/utils/cn';
import { navSections } from './navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const baseLinkStyles =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-800/80 hover:text-slate-50';

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of navSections) {
      if (section.items?.some((item) => location.pathname.startsWith(item.to))) {
        initial[section.label] = true;
      }
    }
    return initial;
  });

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const section of navSections) {
        if (section.items?.some((item) => location.pathname.startsWith(item.to))) {
          next[section.label] = true;
        }
      }
      return next;
    });
  }, [location.pathname]);

  const handleToggle = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-slate-950/95 px-4 py-6 text-slate-300">
      <div className="px-2">
        <div className="text-xs uppercase tracking-widest text-slate-500">System</div>
        <div className="text-lg font-semibold text-slate-100">School Control Center</div>
      </div>
      <nav className="space-y-2">
        {navSections.map((section) => {
          const Icon = section.icon;
          const hasChildren = Boolean(section.items?.length);
          const sectionActive = section.to
            ? location.pathname.startsWith(section.to)
            : section.items?.some((item) => location.pathname.startsWith(item.to));
          const isSectionOpen = openSections[section.label] ?? Boolean(sectionActive);

          return (
            <Fragment key={section.label}>
              {section.to && !hasChildren ? (
                <NavLink
                  to={section.to}
                  className={({ isActive }) =>
                    cn(
                      baseLinkStyles,
                      isActive
                        ? 'bg-brand/15 text-brand-foreground hover:bg-brand/20'
                        : 'text-slate-300',
                    )
                  }
                  onClick={onClose}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </NavLink>
              ) : (
                <div className="space-y-1">
                  <button
                    type="button"
                    className={cn(
                      baseLinkStyles,
                      'w-full justify-between text-left',
                      isSectionOpen && 'bg-slate-800/80 text-slate-100',
                    )}
                    onClick={() => handleToggle(section.label)}
                    aria-expanded={isSectionOpen}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', isSectionOpen && 'rotate-180')}
                    />
                  </button>
                  <div className={cn('space-y-1 overflow-hidden transition-all', !isSectionOpen && 'hidden')}>
                    {section.items?.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'ml-4 flex items-center rounded-md px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/40 hover:text-slate-100',
                            isActive && 'bg-brand/15 text-brand-foreground',
                          )
                        }
                        onClick={onClose}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3 border-t border-slate-800/60 pt-4 text-sm">
        {user ? (
          <div className="space-y-1">
            <p className="text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">You are not signed in.</p>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg bg-slate-900/70 px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800/80 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <aside>
      <div className="hidden lg:block lg:w-72">
        <div className="fixed inset-y-0 left-0 w-72 border-r border-slate-800/60" aria-label="Sidebar">
          {sidebarContent}
        </div>
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />
          <div className="relative ml-0 flex w-72 flex-1 border-r border-slate-800/60 bg-slate-950/95 drop-shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </aside>
  );
};
