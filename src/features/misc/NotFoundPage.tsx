import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-rose-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-slate-100 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Page Not Found</h2>
        
        <p className="text-slate-400 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand/90"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-5 py-2.5 font-medium text-slate-300 transition hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            If you believe this is an error, please{' '}
            <a href="/support" className="text-brand hover:underline">contact support</a>.
          </p>
        </div>
      </div>
    </div>
  );
};