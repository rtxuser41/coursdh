import React from "react";
import type { Group, Student } from "../types";

interface HomeProps {
  groups: Group[];
  students: Student[];
  onViewGroup: (id: string) => void;
  onViewFinancial: () => void;
  onManageGroups: () => void;
}

const Home: React.FC<HomeProps> = ({ groups, students, onViewGroup, onViewFinancial, onManageGroups }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-3 pt-8">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-4xl font-black bg-gradient-to-l from-slate-800 to-slate-950 bg-clip-text text-transparent">
            إدارة الدروس الخصوصية
          </h1>
          <p className="text-slate-500 text-sm">نظام احترافي لتتبع الحصص والمدفوعات</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={() => groups.length > 0 && onViewGroup(groups[0].id)}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/30 active:scale-[0.98] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative text-center space-y-3">
              <div className="text-5xl">👥</div>
              <div className="text-xl font-bold">المجموعات</div>
              <div className="text-emerald-100 text-sm">{groups.length} مجموعة</div>
            </div>
          </button>

          <button
            onClick={onViewFinancial}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative text-center space-y-3">
              <div className="text-5xl">📊</div>
              <div className="text-xl font-bold">التقرير المالي</div>
              <div className="text-blue-100 text-sm">المداخيل المحصلة</div>
            </div>
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-3xl p-6 shadow-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-emerald-600">{groups.length}</div>
              <div className="text-xs text-slate-500 mt-1">مجموعات</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-600">{students.length}</div>
              <div className="text-xs text-slate-500 mt-1">طلاب</div>
            </div>
            <div>
              <div className="text-3xl font-black text-indigo-600">
                {students.filter((s) => {
                  const g = groups.find((gg) => gg.id === s.groupId);
                  return g && s.sessionsOwed >= g.sessionsPerMonth;
                }).length}
              </div>
              <div className="text-xs text-slate-500 mt-1">مدينون</div>
            </div>
          </div>
        </div>

        <button
          onClick={onManageGroups}
          className="w-full bg-gradient-to-l from-slate-700 to-slate-800 text-white rounded-2xl py-5 text-base font-bold shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            <span>⚙️</span>
            <span>إدارة المجموعات</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Home;
