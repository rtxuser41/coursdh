import React from "react";
import type { Group, Student } from "../types";
import { buildGroupFinanceStats, sumCollected } from "../utils/finance";

interface FinancialReportProps {
  groups: Group[];
  students: Student[];
  onBack: () => void;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ groups, students, onBack }) => {
  const groupStats = buildGroupFinanceStats(groups, students);
  const totalCollected = sumCollected(groupStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-fuchsia-50 p-6" style={{ direction: "rtl" }}>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-5 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all shadow-md"
          >
            ← رجوع
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-black text-slate-900">📊 التقرير المالي</h2>
            <p className="text-sm text-slate-500 mt-1">مجموع المداخيل المحصلة من المجموعات</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 text-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">💰</div>
            <h3 className="text-2xl font-bold opacity-90">المبلغ الإجمالي المحصل</h3>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black">{totalCollected.toFixed(0)} دج</div>
          </div>
        </div>

        <div className="space-y-4">
          {groupStats.map(({ group, collected, studentCount }) => (
            <div
              key={group.id}
              className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{group.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {studentCount} طالب • حصص الأستاذ: {group.teacherSessions ?? 0}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <div className="text-xs text-slate-500 mb-1">المبلغ المحصل</div>
                <div className="text-2xl font-black text-emerald-700">{collected.toFixed(0)} دج</div>
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4 opacity-20">📊</div>
              <p className="text-slate-500 font-medium">لا توجد بيانات مالية بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;
