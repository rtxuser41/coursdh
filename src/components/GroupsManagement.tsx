import React, { useState } from "react";
import type { Group, Student } from "../types";

interface GroupsManagementProps {
  groups: Group[];
  students: Student[];
  onBack: () => void;
  onAddGroup: (g: Omit<Group, "id">) => void;
  onDeleteGroup: (id: string) => void;
  onExport: () => void;
  onImport: (data: string) => void;
}

const GroupsManagement: React.FC<GroupsManagementProps> = ({
  groups,
  students,
  onBack,
  onAddGroup,
  onDeleteGroup,
  onExport,
  onImport,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sessions, setSessions] = useState("4");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !sessions) return;
    onAddGroup({ name, monthlyPrice: Number(price), sessionsPerMonth: Number(sessions) });
    setName("");
    setPrice("");
    setSessions("4");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onImport(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 p-6" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-5 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all shadow-md"
          >
            ← رجوع
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-black text-slate-900">⚙️ إدارة المجموعات</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExport}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl py-4 font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            📥 تصدير البيانات
          </button>
          <button
            onClick={handleImport}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl py-4 font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            📤 استيراد البيانات
          </button>
        </div>

        <form onSubmit={handleAdd} className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="text-center">
            <span className="text-3xl">➕</span>
            <div className="font-bold text-slate-900 text-lg mt-2">إضافة مجموعة جديدة</div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">اسم المجموعة:</label>
            <input
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='مثال: "السنة أولى ثانوي"'
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">السعر الشهري (دج):</label>
              <input
                type="number"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">عدد الحصص:</label>
              <input
                type="number"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                placeholder="4"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-l from-indigo-500 to-indigo-600 text-white rounded-xl py-4 font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            إضافة المجموعة
          </button>
        </form>

        <div className="space-y-4">
          {groups.map((g) => {
            const groupStudents = students.filter((s) => s.groupId === g.id);
            return (
              <div key={g.id} className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{g.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {groupStudents.length} طالب • {g.monthlyPrice} دج • {g.sessionsPerMonth} حصص
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`حذف مجموعة "${g.name}" وجميع طلابها؟`)) {
                        onDeleteGroup(g.id);
                      }
                    }}
                    className="px-4 py-2 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-xl font-bold hover:bg-rose-100 active:scale-95 transition-all text-sm"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            );
          })}

          {groups.length === 0 && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4 opacity-20">📚</div>
              <p className="text-slate-500 font-medium">لا توجد مجموعات بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsManagement;
