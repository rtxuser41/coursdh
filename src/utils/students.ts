import type { Student } from "../types";

export function sortStudentsArabic(students: Student[]): Student[] {
  return [...students].sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export function getStatusColor(sessionsOwed: number, threshold: number) {
  if (sessionsOwed >= threshold) return "🔴";
  if (sessionsOwed < 0) return "💚";
  return "✅";
}
