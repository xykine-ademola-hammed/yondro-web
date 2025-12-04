import React, { useEffect, useState } from "react";

interface NumberInputProps {
  name: string;
  value: string | number | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

const formatNumber = (value: string | number) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("en-US").format(num);
};

const NumberInput: React.FC<NumberInputProps> = ({
  name,
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "",
  min,
  max,
}) => {
  const [displayValue, setDisplayValue] = useState(formatNumber(value ?? ""));

  // Update internal display when parent updates value
  useEffect(() => {
    setDisplayValue(formatNumber(value ?? ""));
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    // const num = Number(raw);

    // Update display value immediately
    setDisplayValue(raw);

    // Emit sanitized value to parent
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: raw },
    };

    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  const handleBlur = () => {
    setDisplayValue(formatNumber(displayValue));
  };

  return (
    <input
      type="text"
      name={name}
      value={displayValue}
      disabled={disabled}
      onChange={handleInput}
      onBlur={handleBlur}
      placeholder={placeholder}
      min={min}
      max={max}
      className={className}
      inputMode="decimal"
    />
  );
};

export default NumberInput;
