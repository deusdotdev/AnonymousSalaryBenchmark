"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SubmitCard } from "@/components/SubmitCard";
import { StatsCard } from "@/components/StatsCard";
import { StatusToast } from "@/components/StatusToast";
import { PageContainer } from "@/components/PageContainer";
import { useSalaryFhe } from "@/hooks/useSalaryFhe";

function parseIndex(value: string | null, fallback: number): number {
  if (value === null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function AppPageInner() {
  const searchParams = useSearchParams();
  const [position, setPosition] = useState(1);
  const [city, setCity] = useState(0);
  const [experience, setExperience] = useState(2);

  useEffect(() => {
    setPosition(parseIndex(searchParams.get("position"), 1));
    setCity(parseIndex(searchParams.get("city"), 0));
    setExperience(parseIndex(searchParams.get("seniority"), 2));
  }, [searchParams]);

  const fhe = useSalaryFhe(position, city, experience);
  const working = fhe.status.phase === "working";

  return (
    <>
      {!fhe.contractConfigured && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700">
          Set <code className="font-mono">NEXT_PUBLIC_SALARY_FHE_ADDRESS</code> after deploying the
          contract to Sepolia to enable submissions.
        </div>
      )}

      {fhe.fheError && (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-600">
          {fhe.fheError}
        </div>
      )}

      <div className="mt-10 grid gap-6 xl:grid-cols-2 xl:gap-8">
        <SubmitCard
          position={position}
          city={city}
          experience={experience}
          setPosition={setPosition}
          setCity={setCity}
          setExperience={setExperience}
          isConnected={fhe.isConnected}
          sdkReady={fhe.sdkReady}
          hasSubmitted={fhe.hasSubmitted}
          contractConfigured={fhe.contractConfigured}
          working={working}
          onSubmit={fhe.submitSalary}
        />
        <StatsCard
          position={position}
          city={city}
          experience={experience}
          participants={fhe.participants}
          tierTarget={fhe.tierTarget}
          pendingPublishTier={fhe.pendingPublishTier}
          latestFinalizedTier={fhe.latestFinalizedTier}
          clearAverage={fhe.clearAverage}
          comparison={fhe.comparison}
          hasSubmitted={fhe.hasSubmitted}
          isConnected={fhe.isConnected}
          sdkReady={fhe.sdkReady}
          contractConfigured={fhe.contractConfigured}
          working={working}
          onRelease={fhe.releaseAverage}
          onCompare={fhe.runComparison}
        />
      </div>

      <StatusToast status={fhe.status} />
    </>
  );
}

export default function AppPage() {
  return (
    <main className="w-full py-10 sm:py-14">
      <PageContainer>
        <AppHeader />
        <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading category…</p>}>
          <AppPageInner />
        </Suspense>
      </PageContainer>
    </main>
  );
}
