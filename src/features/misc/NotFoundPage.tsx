import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-3xl font-semibold text-slate-100">Page not found</h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:bg-brand-muted"
      >
        Go back to dashboard
      </Link>
    </div>
  );
};
