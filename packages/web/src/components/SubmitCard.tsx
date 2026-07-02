"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { MoneyInput } from "@/components/ui/MoneyInput";
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
  hasSubmitted,
  contractConfigured,
  working,
  onSubmit,
}: SubmitCardProps) {
  const [salary, setSalary] = useState("85000");

  const disabled =
    !isConnected || !sdkReady || hasSubmitted || !contractConfigured || working;

  const validSalary = Number(salary) > 0;

  return (
    <Card glow="violet">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-green to-green-deep text-lg">
          &#128274;
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink">Submit your salary</h2>
          <p className="text-xs text-muted">Encrypted locally &middot; one entry per wallet</p>
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
        <MoneyInput label="Annual salary in USD" value={salary} onChange={setSalary} />
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          loading={working}
          disabled={disabled || !validSalary}
          onClick={() => onSubmit(salary)}
        >
          {hasSubmitted ? "Already submitted from this wallet" : "Encrypt & submit"}
        </Button>
        {!isConnected && (
          <p className="mt-3 text-center text-xs text-muted">
            Connect your wallet to encrypt and submit.
          </p>
        )}
      </div>
    </Card>
  );
}
