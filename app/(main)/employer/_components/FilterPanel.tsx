"use client";

import React, { useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Constants ────────────────────────────────────────────────────────────────

const SALARY_MIN = 0;
const SALARY_MAX = 50_000_000;
const SALARY_STEP = 500_000;

const JOB_TYPES = ["Full-time", "Part-time", "Contract"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterValues {
  /** Empty string means no filter applied */
  jobType: string;
  /** 0 means no minimum salary filter */
  minSalary: number;
  /** 0 means no maximum salary filter */
  maxSalary: number;
}

interface FilterPanelProps {
  /** Called when the user clicks Apply or removes an individual badge */
  onApply: (filters: FilterValues) => void;
  /** Optional initial filter values */
  defaultValues?: Partial<FilterValues>;
  /** Optional additional class names */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FILTERS: FilterValues = {
  jobType: "",
  minSalary: 0,
  maxSalary: 0,
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function mergeDefaults(defaults?: Partial<FilterValues>): FilterValues {
  return {
    jobType: defaults?.jobType ?? "",
    minSalary: defaults?.minSalary ?? 0,
    maxSalary: defaults?.maxSalary ?? 0,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ActiveBadgeProps {
  label: string;
  onRemove: () => void;
}

function ActiveBadge({ label, onRemove }: ActiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        "bg-primary/10 text-primary text-xs font-medium"
      )}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className={cn(
          "ml-0.5 rounded-full p-0.5",
          "hover:bg-primary/20 transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        )}
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

// ─── Dual-range Salary Slider ─────────────────────────────────────────────────

interface SalarySliderProps {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  minInputId: string;
  maxInputId: string;
}

function SalarySlider({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minInputId,
  maxInputId,
}: SalarySliderProps) {
  // Effective display values: treat 0 as "no filter" → show at range boundaries
  const effectiveMin = minValue === 0 ? SALARY_MIN : minValue;
  const effectiveMax = maxValue === 0 ? SALARY_MAX : maxValue;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    // Clamp: min cannot exceed max
    const clamped = Math.min(raw, effectiveMax - SALARY_STEP);
    onMinChange(clamped);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    // Clamp: max cannot go below min
    const clamped = Math.max(raw, effectiveMin + SALARY_STEP);
    onMaxChange(clamped);
  };

  // Percentage positions for the filled track
  const minPct = ((effectiveMin - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100;
  const maxPct = ((effectiveMax - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100;

  return (
    <div className="space-y-3">
      {/* Track container */}
      <div className="relative h-5 flex items-center">
        {/* Background track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />

        {/* Filled range track */}
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          aria-hidden="true"
        />

        {/* Min range input */}
        <input
          id={minInputId}
          type="range"
          min={SALARY_MIN}
          max={SALARY_MAX}
          step={SALARY_STEP}
          value={effectiveMin}
          onChange={handleMinChange}
          aria-label="Minimum salary"
          aria-valuemin={SALARY_MIN}
          aria-valuemax={SALARY_MAX}
          aria-valuenow={effectiveMin}
          aria-valuetext={formatRupiah(effectiveMin)}
          className={cn(
            "absolute inset-x-0 h-1.5 w-full appearance-none bg-transparent",
            "cursor-pointer",
            // Thumb styles
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background",
            "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background",
            "[&::-moz-range-thumb]:cursor-pointer",
            "focus-visible:outline-none",
            "[&:focus-visible::-webkit-slider-thumb]:ring-2 [&:focus-visible::-webkit-slider-thumb]:ring-ring",
            "[&:focus-visible::-webkit-slider-thumb]:ring-offset-1"
          )}
        />

        {/* Max range input — layered on top */}
        <input
          id={maxInputId}
          type="range"
          min={SALARY_MIN}
          max={SALARY_MAX}
          step={SALARY_STEP}
          value={effectiveMax}
          onChange={handleMaxChange}
          aria-label="Maximum salary"
          aria-valuemin={SALARY_MIN}
          aria-valuemax={SALARY_MAX}
          aria-valuenow={effectiveMax}
          aria-valuetext={formatRupiah(effectiveMax)}
          className={cn(
            "absolute inset-x-0 h-1.5 w-full appearance-none bg-transparent",
            "cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background",
            "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background",
            "[&::-moz-range-thumb]:cursor-pointer",
            "focus-visible:outline-none",
            "[&:focus-visible::-webkit-slider-thumb]:ring-2 [&:focus-visible::-webkit-slider-thumb]:ring-ring",
            "[&:focus-visible::-webkit-slider-thumb]:ring-offset-1"
          )}
        />
      </div>

      {/* Value labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatRupiah(effectiveMin)}</span>
        <span>{formatRupiah(effectiveMax)}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * FilterPanel — a filter control panel for job listings.
 *
 * - Dropdown for job type (Full-time, Part-time, Contract)
 * - Dual-range slider for salary (IDR, 0–50,000,000, step 500,000)
 * - Apply button commits pending filters and calls `onApply`
 * - Reset button clears all filters and calls `onApply` with empty values
 * - Active filter badges appear below controls after Apply; each badge has an
 *   individual × button that removes that filter and calls `onApply`
 * - Fully accessible: role="group", aria-labelledby, ARIA attributes on all
 *   interactive elements
 *
 * Satisfies: REQ-SEARCH-UI-002 (5.7)
 */
const FilterPanel = ({
  onApply,
  defaultValues,
  className,
}: FilterPanelProps) => {
  const headingId = useId();
  const jobTypeLabelId = useId();
  const salaryLabelId = useId();
  const minSliderId = useId();
  const maxSliderId = useId();

  // Pending (not-yet-applied) filter state
  const [pending, setPending] = useState<FilterValues>(() =>
    mergeDefaults(defaultValues)
  );

  // Applied (committed) filter state — drives the active badges
  const [applied, setApplied] = useState<FilterValues>(() =>
    mergeDefaults(defaultValues)
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleJobTypeChange = (value: string) => {
    // SelectItem value "__none__" represents "no filter"
    setPending((prev) => ({ ...prev, jobType: value === "__none__" ? "" : value }));
  };

  const handleMinSalaryChange = (value: number) => {
    setPending((prev) => ({ ...prev, minSalary: value }));
  };

  const handleMaxSalaryChange = (value: number) => {
    setPending((prev) => ({ ...prev, maxSalary: value }));
  };

  const handleApply = () => {
    setApplied(pending);
    onApply(pending);
  };

  const handleReset = () => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
  };

  // Remove a single active filter badge and immediately re-apply
  const removeJobTypeFilter = () => {
    const updated = { ...applied, jobType: "" };
    setPending(updated);
    setApplied(updated);
    onApply(updated);
  };

  const removeSalaryFilter = () => {
    const updated = { ...applied, minSalary: 0, maxSalary: 0 };
    setPending(updated);
    setApplied(updated);
    onApply(updated);
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const hasAppliedJobType = applied.jobType !== "";
  const hasAppliedSalary = applied.minSalary !== 0 || applied.maxSalary !== 0;
  const hasAnyApplied = hasAppliedJobType || hasAppliedSalary;

  const salaryBadgeLabel = (() => {
    const min = applied.minSalary;
    const max = applied.maxSalary;
    if (min !== 0 && max !== 0) {
      return `Salary: ${formatRupiah(min)} – ${formatRupiah(max)}`;
    }
    if (min !== 0) return `Min salary: ${formatRupiah(min)}`;
    if (max !== 0) return `Max salary: ${formatRupiah(max)}`;
    return "";
  })();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm space-y-4",
        className
      )}
    >
      {/* Panel heading (visually present, also used for aria-labelledby) */}
      <h3
        id={headingId}
        className="text-sm font-semibold text-foreground"
      >
        Filters
      </h3>

      {/* ── Job Type ── */}
      <div className="space-y-1.5">
        <Label id={jobTypeLabelId} htmlFor="filter-job-type">
          Job Type
        </Label>
        <Select
          value={pending.jobType === "" ? "__none__" : pending.jobType}
          onValueChange={handleJobTypeChange}
        >
          <SelectTrigger
            id="filter-job-type"
            aria-labelledby={jobTypeLabelId}
            aria-label="Select job type filter"
          >
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">All types</SelectItem>
            {JOB_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Salary Range ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label id={salaryLabelId}>
            Salary Range
          </Label>
          {(pending.minSalary !== 0 || pending.maxSalary !== 0) && (
            <button
              type="button"
              onClick={() =>
                setPending((prev) => ({ ...prev, minSalary: 0, maxSalary: 0 }))
              }
              aria-label="Clear salary range"
              className={cn(
                "text-xs text-muted-foreground hover:text-foreground transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              )}
            >
              Clear
            </button>
          )}
        </div>

        <div
          role="group"
          aria-labelledby={salaryLabelId}
        >
          <SalarySlider
            minValue={pending.minSalary}
            maxValue={pending.maxSalary}
            onMinChange={handleMinSalaryChange}
            onMaxChange={handleMaxSalaryChange}
            minInputId={minSliderId}
            maxInputId={maxSliderId}
          />
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          onClick={handleApply}
          aria-label="Apply selected filters"
          className="flex-1"
          size="sm"
        >
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          aria-label="Reset all filters"
          className="flex-1"
          size="sm"
        >
          Reset
        </Button>
      </div>

      {/* ── Active Filter Badges ── */}
      {hasAnyApplied && (
        <div
          role="list"
          aria-label="Active filters"
          className="flex flex-wrap gap-1.5 pt-1 border-t border-border"
        >
          {hasAppliedJobType && (
            <div role="listitem">
              <ActiveBadge
                label={`Job type: ${applied.jobType}`}
                onRemove={removeJobTypeFilter}
              />
            </div>
          )}
          {hasAppliedSalary && salaryBadgeLabel && (
            <div role="listitem">
              <ActiveBadge
                label={salaryBadgeLabel}
                onRemove={removeSalaryFilter}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
