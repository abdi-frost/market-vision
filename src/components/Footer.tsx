export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Market Vision - Financial Prediction App
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} All rights reserved. This is for
            educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
