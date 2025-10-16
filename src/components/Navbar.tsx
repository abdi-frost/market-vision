import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-slate-900 dark:text-slate-50" />
            <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Market Vision
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/analyze"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50 transition-colors"
            >
              Analyze
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
