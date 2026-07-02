"use client";

import { useState } from "react";
import { CompanyHeader } from "@/components/CompanyHeader";
import { StatusToast } from "@/components/StatusToast";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useCompanyFhe } from "@/hooks/useCompanyFhe";
import { CITIES, MIN_PARTICIPANTS, POSITIONS, SENIORITY_LEVELS } from "@/lib/categories";

export default function CompanyPage() {
  const [position, setPosition] = useState(1);
  const [city, setCity] = useState(0);
  const [experience, setExperience] = useState(2);
  const [salary, setSalary] = useState("90000");

  const fhe = useCompanyFhe(position, city, experience);
  const working = fhe.status.phase === "working";

  const baseDisabled =
    !fhe.isConnected || !fhe.sdkReady || !fhe.contractConfigured || working;
  const validSalary = Number(salary) > 0;
  const enoughEmployees = fhe.employeeCount >= MIN_PARTICIPANTS;

  return (
    <main className="w-full py-10 sm:py-14">
      <PageContainer>
      <CompanyHeader />

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
        {/* Add employee salaries */}
        <Card glow="violet">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-green to-green-deep text-lg">
              &#127970;
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Add employee salaries</h2>
              <p className="text-xs text-muted">Encrypted locally &middot; one entry per employee</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Select
              label="Position"
              icon="&#128188;"
              value={position}
              options={POSITIONS}
              onChange={setPosition}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="City" icon="&#127961;" value={city} options={CITIES} onChange={setCity} />
              <Select
                label="Seniority"
                icon="&#9203;"
                value={experience}
                options={SENIORITY_LEVELS}
                onChange={setExperience}
              />
            </div>
            <MoneyInput label="Employee annual salary in USD" value={salary} onChange={setSalary} />
          </div>

          <div className="mt-6">
            <Button
              variant="primary"
              loading={working}
              disabled={baseDisabled || !validSalary}
              onClick={() => fhe.submitEmployee(salary)}
            >
              Encrypt &amp; add employee
            </Button>
            {!fhe.isConnected && (
              <p className="mt-3 text-center text-xs text-muted">
                Connect your company wallet to start adding salaries.
              </p>
            )}
          </div>
        </Card>

        {/* Benchmark */}
        <Card glow="cyan">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf to-green-deep text-lg">
              &#128202;
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Company benchmark</h2>
              <p className="text-xs text-muted">Unlocks at {MIN_PARTICIPANTS} employees</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {[POSITIONS[position], CITIES[city], SENIORITY_LEVELS[experience]].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-green/15 bg-green/5 px-3 py-1 text-xs font-semibold text-green-deep"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 rounded-3xl border border-green/10 bg-green/[0.03] p-5">
            <ProgressRing current={fhe.employeeCount} total={MIN_PARTICIPANTS} />
            <div className="text-center">
              <p className="text-sm text-muted">
                {enoughEmployees
                  ? `${fhe.employeeCount} employees in this category.`
                  : `${MIN_PARTICIPANTS - fhe.employeeCount} more employee(s) needed to benchmark.`}
              </p>
              <p className="mt-1 text-xs text-muted">
                Market reference:{" "}
                {fhe.marketReady
                  ? `${fhe.marketParticipants} participants (average ready)`
                  : `${fhe.marketParticipants}/${MIN_PARTICIPANTS} participants`}
              </p>
            </div>
          </div>

          {fhe.benchmark !== undefined && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-center text-sm font-semibold ${
                fhe.benchmark
                  ? "border-green/30 bg-green/10 text-green-deep"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700"
              }`}
            >
              {fhe.benchmark
                ? "\u2191 Your company pays above the market average."
                : "\u2193 Your company pays at or below the market average."}
            </div>
          )}

          <div className="mt-5">
            <Button
              variant="secondary"
              loading={working}
              disabled={baseDisabled || !enoughEmployees || !fhe.marketReady}
              onClick={fhe.runBenchmark}
            >
              {!enoughEmployees
                ? "Add more employees to benchmark"
                : !fhe.marketReady
                  ? "Waiting for market average"
                  : "Benchmark privately"}
            </Button>
          </div>
        </Card>
      </div>

      <StatusToast status={fhe.status} />
      </PageContainer>
    </main>
  );
}
