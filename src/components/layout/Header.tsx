import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth';
import { cn } from '@/utils/cn';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export const Header = ({ title, onToggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/70 bg-slate-950/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-100 md:text-xl">{title}</h1>
      </div>
      <Menu as="div" className="relative">
        <Menu.Button as={Button} variant="ghost" size="sm" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-brand-foreground">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'NA'}
          </div>
          <div className="hidden text-left text-sm leading-tight sm:block">
            <p className="font-semibold text-slate-100">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-slate-400">{user?.role ?? 'No role'}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/95 text-sm shadow-xl focus:outline-none">
            <div className="px-4 py-3 text-slate-200">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center px-4 py-2 text-left text-slate-200',
                    active && 'bg-slate-800/80',
                  )}
                  onClick={logout}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </header>
  );
};
