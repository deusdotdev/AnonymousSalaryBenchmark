"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { IconBadge } from "@/components/icons/IconBadge";
import { CITIES, POSITIONS, SENIORITY_LEVELS } from "@/lib/categories";

interface SubmitCardProps {
  position: number;
  city: number;
  experience: number;
  setPosition: (v: number) => void;
  setCity: (v: number) => void;
  setExperience: (v: number) => void;
  isConnected: boolean;
  sdkReady: boolean;
  sdkLoading: boolean;
  hasSubmitted: boolean;
  contractConfigured: boolean;
  working: boolean;
  onSubmit: (salaryUsd: string) => void;
}

export function SubmitCard({
  position,
  city,
  experience,
  setPosition,
  setCity,
  setExperience,
  isConnected,
  sdkReady,
  sdkLoading,
  hasSubmitted,
  contractConfigured,
  working,
  onSubmit,
}: SubmitCardProps) {
  const [salary, setSalary] = useState("85000");

  const disabled =
    !isConnected || sdkLoading || !sdkReady || hasSubmitted || !contractConfigured || working;

  const validSalary = Number(salary) > 0;

  const buttonLabel = hasSubmitted
    ? "Already submitted from this wallet"
    : sdkLoading
      ? "Preparing encryption…"
      : !sdkReady && isConnected
        ? "Encryption engine loading…"
        : "Encrypt & submit";

  return (
    <Card glow="violet">
      <div className="mb-5 flex items-center gap-3">
        <IconBadge name="lock" className="shrink-0" />
        <div>
          <h2 className="text-lg font-bold text-ink">Submit your salary</h2>
          <p className="text-xs text-muted">Encrypted locally &middot; one entry per wallet</p>
        </div>
      </div>

      <div className="grid gap-4">
        <Select
          label="Position"
          icon="briefcase"
          value={position}
          options={POSITIONS}
          onChange={setPosition}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="City" icon="building" value={city} options={CITIES} onChange={setCity} />
          <Select
            label="Seniority"
            icon="clock"
            value={experience}
            options={SENIORITY_LEVELS}
            onChange={setExperience}
          />
        </div>
        <MoneyInput label="Annual salary in USD" value={salary} onChange={setSalary} />
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          loading={working || (sdkLoading && isConnected)}
          disabled={disabled || !validSalary}
          onClick={() => onSubmit(salary)}
        >
          {buttonLabel}
        </Button>
        {isConnected && sdkLoading && (
          <p className="mt-3 text-center text-xs text-muted">
            First load downloads FHE modules (~5s). Later submits are faster.
          </p>
        )}
        {!isConnected && (
          <p className="mt-3 text-center text-xs text-muted">
            Connect your wallet to encrypt and submit.
          </p>
        )}
      </div>
    </Card>
  );
}
