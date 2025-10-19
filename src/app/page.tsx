import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";
import { ServerBiasSummary } from "@/components/ServerBiasSummary";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            Market Vision - Forex Prediction
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Real-time forex market data and AI-powered predictions
          </p>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Prediction (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <HomeClient />
          </div>

          {/* Right Column - Bias Summary Panel (1 column) */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
              }
            >
              <ServerBiasSummary />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
