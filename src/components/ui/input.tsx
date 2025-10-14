"use client";

import React, { FC, InputHTMLAttributes, useMemo } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const sanitizeId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Input: FC<InputProps> = ({ label, className, id, required, placeholder, ...props }) => {
  const inputId = useMemo(() => (id ? id : sanitizeId(label)), [id, label]);
  const resolvedPlaceholder = placeholder ?? label;

  return (
    <div className="relative w-full">
      <input
        {...props}
        id={inputId}
        placeholder={resolvedPlaceholder}
        required={required}
        className={clsx(
          "peer block w-full rounded-xl border border-gray-500/50 bg-transparent px-4 pt-5 pb-2 text-base text-gray-100 placeholder-transparent transition-colors focus:border-blue-500 focus:outline-none",
          className
        )}
      />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute left-4 top-2.5 rounded bg-[#07071A] px-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-400 transition-all peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:bg-[#07071A] peer-focus:text-blue-400"
      >
        {label}
      </label>
    </div>
  );
};

export default Input;
