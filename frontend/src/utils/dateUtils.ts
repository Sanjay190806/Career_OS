import { TOTAL_DAYS } from '../data/constants';

export function getTodayDay(startDateStr: string): number {
  const start = new Date(startDateStr || '2026-07-01');
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diff + 1, 1), TOTAL_DAYS);
}

export function getDateForDay(day: number, startDateStr: string): Date {
  const start = new Date(startDateStr || '2026-07-01');
  const d = new Date(start);
  d.setDate(d.getDate() + day - 1);
  return d;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function getPhaseName(day: number): string {
  if (day <= 22) return "Arrays Foundation";
  if (day <= 54) return "Strings & Hashing";
  if (day <= 89) return "Linear Structures";
  if (day <= 120) return "Trees & Graphs";
  if (day <= 142) return "Backtracking & DP";
  if (day <= 165) return "Revision Phase";
  return "Mock & Final Prep";
}
