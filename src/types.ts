export type View = "home" | "groupDetail" | "financialReport" | "groupsManagement";

export interface Group {
  id: string;
  name: string;
  monthlyPrice: number;
  sessionsPerMonth: number;
  teacherSessions?: number;
}

export interface Student {
  id: string;
  name: string;
  phone?: string;
  groupId: string;
  sessionsOwed: number;
  individualPrice: number | null;
  collected?: number;
}
