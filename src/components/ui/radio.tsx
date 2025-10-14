"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react"; // lightweight icon alternative to SVG

interface Option {
  id: string;
  label: string;
}

interface RadioProps {
  options: Option[];
  defaultOption?: string;
  onValueChange?: (id: string) => void;
  className?: string;
  label?: string;
}

const Radio: React.FC<RadioProps> = ({
  options,
  defaultOption = options[0]?.id,
  onValueChange,
  className,
  label,
}) => {
  const [selected, setSelected] = useState(defaultOption);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelected(defaultOption);
  }, [defaultOption]);

  const selectedLabel = useMemo(
    () => options.find((opt) => opt.id === selected)?.label || "Select",
    [options, selected]
  );
  useEffect(() => {
    if (!selected) return;
    onValueChange?.(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className={clsx("text-white", className)}>
      {label ? (
        <span className="mb-1 block text-sm text-white/70">{label}</span>
      ) : null}
      <div className="relative">
        {/* Selected option */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#1d1f2d] px-3 py-2 text-sm transition-colors hover:bg-[#24273a] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown options */}
        {open ? (
          <div
            role="listbox"
            className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-[#1d1f2d] shadow-xl"
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={option.id === selected}
                className={clsx(
                  "block w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-[#24273a]",
                  option.id === selected ? "bg-[#151725] text-white/80" : ""
                )}
                onClick={() => {
                  setSelected(option.id);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Radio;
