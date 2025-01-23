import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatText(text: string, maxLength = 22) {
  const fullName = `${text}`;
  if (fullName.length > maxLength) {
    return `${fullName.slice(0, maxLength - 3)}...`;
  }
  return fullName;
}

export function formatNumberWithCommas(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
