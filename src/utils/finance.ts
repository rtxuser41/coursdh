import type { Group, Student } from "../types";

export interface GroupFinanceStats {
  group: Group;
  collected: number;
  studentCount: number;
}

export function buildGroupFinanceStats(groups: Group[], students: Student[]): GroupFinanceStats[] {
  return groups.map((group) => {
    const groupStudents = students.filter((s) => s.groupId === group.id);
    const collected = groupStudents.reduce((sum, s) => sum + (s.collected ?? 0), 0);
    return {
      group,
      collected,
      studentCount: groupStudents.length,
    };
  });
}

export function sumCollected(stats: GroupFinanceStats[]): number {
  return stats.reduce((sum, g) => sum + g.collected, 0);
}
