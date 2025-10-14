export function formatToTwoDecimalPlaces(number: string) {
  if (number === null) return "0.00";
  const fixedNumber = parseFloat(number).toFixed(2);
  const parts = fixedNumber.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export interface MoneyDisplayProps {
  className?: string;
  value?: string | number | null | undefined;
}

/**
 * Formats number to a string with two decimal places
 * (Assumes formatToTwoDecimalPlaces is defined elsewhere in the file)
 */

export default function MoneyDisplay({ className, value }: MoneyDisplayProps) {
  return (
    <span className={className}>
      {"₦"}
      {value ? formatToTwoDecimalPlaces(String(value)) : "0.00"}
    </span>
  );
}
