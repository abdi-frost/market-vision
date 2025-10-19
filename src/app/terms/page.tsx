import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
        <h1 className="text-2xl font-semibold mb-4">Terms & Disclaimer</h1>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Market Vision is provided for educational and informational purposes only. The
          content on this site reflects my personal observations and experiments and is not
          intended to be professional financial advice.
        </p>

        <h2 className="text-lg font-medium mt-4 mb-2">Not Financial Advice</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          I am not a financial advisor. Nothing on this site should be construed as
          an offer to buy or sell securities, currencies, or other financial instruments.
          You should not rely on any information on this site for making investment decisions.
        </p>

        <h2 className="text-lg font-medium mt-4 mb-2">Personal Use & Educational Purpose</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          This project is primarily for my own personal use and learning. Examples,
          charts, predictions, or analyses are demonstrations and educational material.
          Always conduct your own research and consider consulting a licensed professional
          before making financial decisions.
        </p>

        <h2 className="text-lg font-medium mt-4 mb-2">No Guarantees</h2>
        <p className="mb-6 text-slate-700 dark:text-slate-300">
          Past performance or simulated results are not indicative of future results. All
          data and analyses are provided &quot;as is&quot; without warranty of any kind.
        </p>

        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
          >
            &larr; Back to home
          </Link>

          <Link
            href="/"
            className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Explore Market Vision
          </Link>
        </div>
      </div>
    </main>
  );
}
