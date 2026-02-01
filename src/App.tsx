import React, { useEffect, useState } from "react";

type View = "home" | "groupDetail" | "financialReport" | "groupsManagement";

interface Group {
  id: string;
  name: string;
  monthlyPrice: number;
  sessionsPerMonth: number;
}

interface Student {
  id: string;
  name: string;
  groupId: string;
  sessionsOwed: number;
  individualPrice: number | null;
}

function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }, [key, value]);

  return [value, setValue];
}

function sortStudentsArabic(students: Student[]): Student[] {
  return [...students].sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

function getStatusColor(sessionsOwed: number, threshold: number) {
  if (sessionsOwed >= threshold) return "🔴";
  if (sessionsOwed < 0) return "💚";
  return "✅";
}

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
              <div className="text-blue-100 text-sm">الإحصائيات والمدخول</div>
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

interface GroupDetailProps {
  group: Group;
  students: Student[];
  groups: Group[];
  onBack: () => void;
  onAddStudent: (name: string, price: string) => void;
  onMarkPresent: (id: string) => void;
  onMarkPayment: (id: string) => void;
  onEditStudent: (id: string, name: string, sessions: number, price: string) => void;
  onDeleteStudent: (id: string) => void;
  onNextGroup: () => void;
  onPrevGroup: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  students,
  groups,
  onBack,
  onAddStudent,
  onMarkPresent,
  onMarkPayment,
  onEditStudent,
  onDeleteStudent,
  onNextGroup,
  onPrevGroup,
}) => {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSessions, setEditSessions] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const sortedStudents = sortStudentsArabic(students);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStudent(newName, newPrice);
    setNewName("");
    setNewPrice("");
  };

  const openEdit = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditSessions(student.sessionsOwed.toString());
    setEditPrice(student.individualPrice?.toString() || "");
  };

  const handleEdit = () => {
    if (!editingId || !editName.trim()) return;
    onEditStudent(editingId, editName, Number(editSessions), editPrice);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (!editingId) return;
    if (confirm("هل أنت متأكد من حذف هذا الطالب نهائياً؟")) {
      onDeleteStudent(editingId);
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-6" style={{ direction: "rtl" }}>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-5 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all shadow-md"
          >
            ← رجوع
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-black text-slate-900">{group.name}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {students.length} طالب • {group.monthlyPrice} دج • {group.sessionsPerMonth} حصص
            </p>
          </div>
        </div>

        {groups.length > 1 && (
          <div className="flex gap-3">
            <button
              onClick={onPrevGroup}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-700 rounded-xl py-3 font-bold hover:bg-slate-50 active:scale-95 transition-all"
            >
              → المجموعة السابقة
            </button>
            <button
              onClick={onNextGroup}
              className="flex-1 bg-white border-2 border-slate-200 text-slate-700 rounded-xl py-3 font-bold hover:bg-slate-50 active:scale-95 transition-all"
            >
              المجموعة التالية ←
            </button>
          </div>
        )}

        <form onSubmit={handleAdd} className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="text-center">
            <span className="text-3xl">➕</span>
            <div className="font-bold text-slate-900 text-lg mt-2">إضافة طالب جديد</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="col-span-1 border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="الاسم الكامل"
            />
            <input
              type="number"
              className="col-span-1 border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder={`سعر خاص (${group.monthlyPrice})`}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl py-4 font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            إضافة الطالب
          </button>
        </form>

        <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-l from-slate-700 to-slate-800 text-white px-6 py-4">
            <h3 className="text-xl font-bold">📋 قائمة الطلاب (ترتيب أبجدي)</h3>
          </div>

          {sortedStudents.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-20">👥</div>
              <p className="text-slate-500 font-medium">لا يوجد طلاب في هذه المجموعة</p>
            </div>
          )}

          {sortedStudents.map((student, idx) => (
            <div
              key={student.id}
              className={`p-5 border-b border-slate-200 hover:bg-slate-50 transition-all ${
                idx === sortedStudents.length - 1 ? "border-b-0" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl font-bold text-slate-400">{idx + 1}.</span>
                  <span className="text-lg font-bold text-slate-900">{student.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusColor(student.sessionsOwed, group.sessionsPerMonth)}</span>
                  <span className="px-4 py-2 bg-slate-100 border-2 border-slate-300 rounded-xl font-black text-slate-700">
                    {student.sessionsOwed} حصة
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onMarkPresent(student.id)}
                  className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  ✓ حضر
                </button>
                <button
                  onClick={() => onMarkPayment(student.id)}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  💳 دفع
                </button>
                <button
                  onClick={() => openEdit(student)}
                  className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  ✏️ تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in"
          onClick={() => setEditingId(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: "rtl" }}
          >
            <h3 className="text-2xl font-black text-slate-900 mb-6 text-center">✏️ تعديل بيانات الطالب</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل:</label>
                <input
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">عدد الحصص الحالي:</label>
                <input
                  type="number"
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  value={editSessions}
                  onChange={(e) => setEditSessions(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  السعر الشهري الخاص: <span className="text-slate-400 text-xs">(فارغ = سعر المجموعة)</span>
                </label>
                <input
                  type="number"
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder={`${group.monthlyPrice}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl py-4 font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                  💾 حفظ
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-slate-200 text-slate-700 rounded-xl py-4 font-bold hover:bg-slate-300 active:scale-95 transition-all"
                >
                  ❌ إلغاء
                </button>
              </div>

              <button
                onClick={handleDelete}
                className="w-full bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-xl py-4 font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all mt-4"
              >
                🗑️ حذف الطالب نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FinancialReportProps {
  groups: Group[];
  students: Student[];
  onBack: () => void;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ groups, students, onBack }) => {
  let totalCollected = 0;
  let totalExpected = 0;

  const groupStats = groups.map((group) => {
    const groupStudents = students.filter((s) => s.groupId === group.id);
    let collected = 0;
    let expected = 0;

    groupStudents.forEach((student) => {
      const price = student.individualPrice ?? group.monthlyPrice;
      expected += price;

      const unitPrice = price / group.sessionsPerMonth;
      const owed = student.sessionsOwed;

      if (owed > 0) {
        collected += price - owed * unitPrice;
      } else {
        collected += price + Math.abs(owed) * unitPrice;
      }
    });

    totalCollected += collected;
    totalExpected += expected;

    return {
      group,
      collected: Math.max(0, collected),
      expected,
      remaining: Math.max(0, expected - collected),
      studentCount: groupStudents.length,
    };
  });

  const totalRemaining = Math.max(0, totalExpected - totalCollected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6" style={{ direction: "rtl" }}>
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
            <p className="text-sm text-slate-500 mt-1">نظرة شاملة على المدخول والديون</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">💰</div>
            <h3 className="text-2xl font-bold opacity-90">المدخول الإجمالي</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-xs opacity-80 mb-2">المحصّل</div>
              <div className="text-2xl font-black">{totalCollected.toFixed(0)}</div>
              <div className="text-xs opacity-70 mt-1">دج</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-xs opacity-80 mb-2">المتوقع</div>
              <div className="text-2xl font-black">{totalExpected.toFixed(0)}</div>
              <div className="text-xs opacity-70 mt-1">دج</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-xs opacity-80 mb-2">المتبقي</div>
              <div className="text-2xl font-black">{totalRemaining.toFixed(0)}</div>
              <div className="text-xs opacity-70 mt-1">دج</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 px-2">📁 تفاصيل المجموعات:</h3>

          {groupStats.map(({ group, collected, expected, remaining, studentCount }) => (
            <div
              key={group.id}
              className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{group.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {studentCount} طالب • {group.monthlyPrice} دج
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">نسبة التحصيل</div>
                  <div className="text-3xl font-black text-emerald-600">
                    {expected > 0 ? ((collected / expected) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                  <div className="text-xs text-emerald-700 mb-1">محصّل</div>
                  <div className="text-2xl font-black text-emerald-800">{collected.toFixed(0)}</div>
                  <div className="text-xs text-emerald-600 mt-1">دج</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 rounded-2xl p-4 text-center">
                  <div className="text-xs text-rose-700 mb-1">متبقي</div>
                  <div className="text-2xl font-black text-rose-800">{remaining.toFixed(0)}</div>
                  <div className="text-xs text-rose-600 mt-1">دج</div>
                </div>
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
    input.onchange = (e: any) => {
      const file = e.target.files[0];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 p-6" style={{ direction: "rtl" }}>
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

function App() {
  const [groups, setGroups] = useLocalStorage<Group[]>("groups_v2", []);
  const [students, setStudents] = useLocalStorage<Student[]>("students_v2", []);
  const [view, setView] = useState<View>("home");
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  const currentGroup = groups.find((g) => g.id === currentGroupId);
  const currentStudents = students.filter((s) => s.groupId === currentGroupId);

  const addGroup = (g: Omit<Group, "id">) => {
    const newGroup = { ...g, id: Date.now().toString() };
    setGroups([...groups, newGroup]);
  };

  const deleteGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
    setStudents(students.filter((s) => s.groupId !== id));
  };

  const addStudent = (name: string, price: string) => {
    if (!currentGroupId) return;
    const newStudent: Student = {
      id: Date.now().toString(),
      name,
      groupId: currentGroupId,
      sessionsOwed: 0,
      individualPrice: price ? Number(price) : null,
    };
    setStudents([...students, newStudent]);
  };

  const markPresent = (id: string) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, sessionsOwed: s.sessionsOwed + 1 } : s)));
  };

  const markPayment = (id: string) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    const group = groups.find((g) => g.id === student.groupId);
    if (!group) return;
    setStudents(students.map((s) => (s.id === id ? { ...s, sessionsOwed: s.sessionsOwed - group.sessionsPerMonth } : s)));
  };

  const editStudent = (id: string, name: string, sessions: number, price: string) => {
    setStudents(
      students.map((s) =>
        s.id === id ? { ...s, name, sessionsOwed: sessions, individualPrice: price ? Number(price) : null } : s
      )
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const exportData = () => {
    const data = { groups, students };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.groups) setGroups(data.groups);
      if (data.students) setStudents(data.students);
      alert("✅ تم الاستيراد بنجاح!");
    } catch {
      alert("❌ خطأ في الملف");
    }
  };

  const goToNextGroup = () => {
    const idx = groups.findIndex((g) => g.id === currentGroupId);
    const nextIdx = (idx + 1) % groups.length;
    setCurrentGroupId(groups[nextIdx].id);
  };

  const goToPrevGroup = () => {
    const idx = groups.findIndex((g) => g.id === currentGroupId);
    const prevIdx = idx === 0 ? groups.length - 1 : idx - 1;
    setCurrentGroupId(groups[prevIdx].id);
  };

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>

      {view === "home" && (
        <Home
          groups={groups}
          students={students}
          onViewGroup={(id) => {
            setCurrentGroupId(id);
            setView("groupDetail");
          }}
          onViewFinancial={() => setView("financialReport")}
          onManageGroups={() => setView("groupsManagement")}
        />
      )}

      {view === "groupDetail" && currentGroup && (
        <GroupDetail
          group={currentGroup}
          students={currentStudents}
          groups={groups}
          onBack={() => setView("home")}
          onAddStudent={addStudent}
          onMarkPresent={markPresent}
          onMarkPayment={markPayment}
          onEditStudent={editStudent}
          onDeleteStudent={deleteStudent}
          onNextGroup={goToNextGroup}
          onPrevGroup={goToPrevGroup}
        />
      )}

      {view === "financialReport" && <FinancialReport groups={groups} students={students} onBack={() => setView("home")} />}

      {view === "groupsManagement" && (
        <GroupsManagement
          groups={groups}
          students={students}
          onBack={() => setView("home")}
          onAddGroup={addGroup}
          onDeleteGroup={deleteGroup}
          onExport={exportData}
          onImport={importData}
        />
      )}
    </>
  );
}

export default App;
