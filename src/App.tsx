import React, { useEffect, useState } from "react";

// ========== TYPES ==========
type View = "dashboard" | "groups" | "groupDetail";

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

// ========== localStorage Hook ==========
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
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

// ========== HELPER FUNCTIONS ==========
function getUnitPrice(student: Student, group: Group): number {
  const price = student.individualPrice ?? group.monthlyPrice;
  return price / group.sessionsPerMonth;
}

function getStudentStatus(student: Student, group: Group) {
  const unitPrice = getUnitPrice(student, group);
  const owed = student.sessionsOwed;

  if (owed >= group.sessionsPerMonth) {
    const debt = owed * unitPrice;
    return {
      label: "عليه دفع",
      badgeColor: "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800 border-2 border-rose-300",
      boxColor: "border-rose-200 bg-gradient-to-br from-rose-50 to-white text-rose-800",
      value: debt.toFixed(2) + " دج",
      isDebt: true,
    };
  }

  if (owed < 0) {
    const credit = Math.abs(owed) * unitPrice;
    return {
      label: "رصيد مسبق",
      badgeColor: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-300",
      boxColor: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-800",
      value: credit.toFixed(2) + " دج",
      isDebt: false,
    };
  }

  return {
    label: "منتظم",
    badgeColor: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-2 border-slate-300",
    boxColor: "border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-700",
    value: `${owed} حصة`,
    isDebt: false,
  };
}

// ========== DASHBOARD ==========
interface DashboardProps {
  groups: Group[];
  students: Student[];
  goToGroups: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ groups, students, goToGroups }) => {
  let totalDebt = 0;
  let totalCredit = 0;

  students.forEach((s) => {
    const g = groups.find((gg) => gg.id === s.groupId);
    if (!g) return;
    const unit = getUnitPrice(s, g);
    if (s.sessionsOwed > 0) totalDebt += s.sessionsOwed * unit;
    if (s.sessionsOwed < 0) totalCredit += Math.abs(s.sessionsOwed) * unit;
  });

  const net = totalCredit - totalDebt;

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: "rtl" }}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-l from-slate-700 to-slate-900 bg-clip-text text-transparent">
          لوحة التحكم
        </h2>
        <p className="text-slate-500 text-sm">نظرة شاملة على نشاطك</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👥</span>
              <span className="text-sm font-medium text-indigo-600">عدد التلاميذ</span>
            </div>
            <p className="text-5xl font-black text-indigo-900 tracking-tight">{students.length}</p>
            <p className="text-xs text-indigo-500 mt-2">في {groups.length} مجموعة</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-50 border border-rose-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 left-0 w-32 h-32 bg-rose-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💳</span>
              <span className="text-sm font-medium text-rose-600">الديون المستحقة</span>
            </div>
            <p className="text-4xl font-black text-rose-900 tracking-tight">{totalDebt.toFixed(2)}</p>
            <p className="text-xs text-rose-500 mt-2">دينار جزائري</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💰</span>
              <span className="text-sm font-medium text-emerald-600">الرصيد المسبق</span>
            </div>
            <p className="text-4xl font-black text-emerald-900 tracking-tight">{totalCredit.toFixed(2)}</p>
            <p className="text-xs text-emerald-500 mt-2">دينار جزائري</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50 border border-amber-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <span className="text-sm font-medium text-amber-600">الصافي</span>
            </div>
            <p className={`text-4xl font-black tracking-tight ${net >= 0 ? "text-emerald-900" : "text-rose-900"}`}>
              {net.toFixed(2)}
            </p>
            <p className="text-xs text-amber-500 mt-2">الرصيد - الديون</p>
          </div>
        </div>
      </div>

      <button
        onClick={goToGroups}
        className="w-full relative overflow-hidden bg-gradient-to-l from-slate-800 to-slate-900 text-white rounded-2xl py-5 text-lg font-bold shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-300 group"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <span className="relative flex items-center justify-center gap-2">
          <span>إدارة المجموعات</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">←</span>
        </span>
      </button>
    </div>
  );
};

// ========== GROUPS LIST ==========
interface GroupsListProps {
  groups: Group[];
  students: Student[];
  addGroup: (g: Omit<Group, "id">) => void;
  deleteGroup: (id: string) => void;
  openGroup: (id: string) => void;
  exportData: () => void;
  importData: (data: string) => void;
}

const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  students,
  addGroup,
  deleteGroup,
  openGroup,
  exportData,
  importData,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sessions, setSessions] = useState("4");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !sessions) return;
    addGroup({ name, monthlyPrice: Number(price), sessionsPerMonth: Number(sessions) });
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
          importData(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: "rtl" }}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-l from-slate-700 to-slate-900 bg-clip-text text-transparent">
          المجموعات
        </h2>
        <p className="text-slate-500 text-sm">إدارة الأفواج والحصص</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={exportData}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl py-4 text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span className="relative flex items-center justify-center gap-2">
            <span>📥</span>
            <span>تصدير</span>
          </span>
        </button>
        <button
          onClick={handleImport}
          className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl py-4 text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span className="relative flex items-center justify-center gap-2">
            <span>📤</span>
            <span>استيراد</span>
          </span>
        </button>
      </div>

      <form className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xl" onSubmit={handleAdd}>
        <div className="text-center">
          <span className="text-2xl">➕</span>
          <div className="font-bold text-slate-900 text-lg mt-1">إضافة مجموعة</div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-slate-600 font-semibold">اسم المجموعة</label>
          <input
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='مثال: "السنة أولى ثانوي"'
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm text-slate-600 font-semibold">السعر (دج)</label>
            <input
              type="number"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2000"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-slate-600 font-semibold">الحصص</label>
            <input
              type="number"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              value={sessions}
              onChange={(e) => setSessions(e.target.value)}
              placeholder="4"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl py-4 text-base font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300"
        >
          إضافة المجموعة
        </button>
      </form>

      <div className="space-y-4">
        {groups.length === 0 && (
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4 opacity-30">📚</div>
            <p className="text-slate-500 font-medium">لا توجد مجموعات بعد</p>
          </div>
        )}
        {groups.map((g) => {
          const groupStudents = students.filter((s) => s.groupId === g.id);
          let groupDebt = 0;
          let groupCredit = 0;
          groupStudents.forEach((s) => {
            const unit = getUnitPrice(s, g);
            if (s.sessionsOwed > 0) groupDebt += s.sessionsOwed * unit;
            if (s.sessionsOwed < 0) groupCredit += Math.abs(s.sessionsOwed) * unit;
          });

          return (
            <div
              key={g.id}
              className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-xl mb-1">{g.name}</div>
                  <div className="text-sm text-slate-500">
                    {groupStudents.length} تلميذ • {g.monthlyPrice} دج • {g.sessionsPerMonth} حصص
                  </div>
                </div>
                <button
                  className="px-3 py-1 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 active:scale-95 transition-all"
                  onClick={() => {
                    if (confirm("حذف المجموعة؟")) deleteGroup(g.id);
                  }}
                >
                  حذف
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl p-3 text-center">
                  <div className="text-xs text-rose-600 mb-1">ديون</div>
                  <div className="font-black text-rose-700 text-lg">{groupDebt.toFixed(2)}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-3 text-center">
                  <div className="text-xs text-emerald-600 mb-1">رصيد</div>
                  <div className="font-black text-emerald-700 text-lg">{groupCredit.toFixed(2)}</div>
                </div>
              </div>

              <button
                onClick={() => openGroup(g.id)}
                className="w-full bg-gradient-to-l from-slate-800 to-slate-900 text-white rounded-xl py-3 text-base font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-300 group-hover:from-emerald-600 group-hover:to-emerald-700"
              >
                فتح المجموعة
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== GROUP DETAIL ==========
interface GroupDetailProps {
  group: Group;
  students: Student[];
  addStudent: (s: Omit<Student, "id" | "sessionsOwed">) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  markPresent: (id: string) => void;
  registerPayment: (id: string) => void;
  goBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  students,
  addStudent,
  updateStudent,
  deleteStudent,
  markPresent,
  registerPayment,
  goBack,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [showDebtOnly, setShowDebtOnly] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addStudent({
      name,
      groupId: group.id,
      individualPrice: price ? Number(price) : null,
    });
    setName("");
    setPrice("");
  };

  const filteredStudents = showDebtOnly
    ? students.filter((s) => s.sessionsOwed >= group.sessionsPerMonth)
    : students;

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: "rtl" }}>
      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 text-sm text-slate-600 border-2 border-slate-300 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-all"
          onClick={goBack}
        >
          ← رجوع
        </button>
        <h2 className="text-2xl font-bold text-slate-900 flex-1 text-center">{group.name}</h2>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-500">السعر الشهري</span>
            <div className="font-black text-slate-900 text-2xl">{group.monthlyPrice} دج</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">عدد الحصص</span>
            <div className="font-black text-slate-900 text-2xl">{group.sessionsPerMonth}</div>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">سعر الحصة</span>
          <div className="font-black text-emerald-700 text-3xl">
            {(group.monthlyPrice / group.sessionsPerMonth).toFixed(2)} دج
          </div>
        </div>
      </div>

      <form className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xl" onSubmit={handleAdd}>
        <div className="text-center">
          <span className="text-2xl">👤</span>
          <div className="font-bold text-slate-900 text-lg mt-1">إضافة تلميذ</div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-slate-600 font-semibold">اسم التلميذ</label>
          <input
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="محمد بن يوسف"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-slate-600 font-semibold">سعر خاص (اختياري)</label>
          <input
            type="number"
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={`${group.monthlyPrice}`}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl py-4 text-base font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300"
        >
          إضافة
        </button>
      </form>

      <button
        onClick={() => setShowDebtOnly(!showDebtOnly)}
        className={`w-full rounded-2xl py-4 text-base font-bold shadow-lg active:scale-[0.98] transition-all duration-300 ${
          showDebtOnly
            ? "bg-gradient-to-l from-rose-500 to-rose-600 text-white"
            : "bg-white border-2 border-slate-300 text-slate-700"
        }`}
      >
        {showDebtOnly ? "عرض الكل" : "المدينون فقط"}
      </button>

      <div className="space-y-5">
        {filteredStudents.length === 0 && !showDebtOnly && (
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4 opacity-30">👥</div>
            <p className="text-slate-500 font-medium">لا يوجد تلاميذ</p>
          </div>
        )}
        {filteredStudents.length === 0 && showDebtOnly && (
          <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-emerald-700 font-bold text-lg">لا يوجد مدينون!</p>
          </div>
        )}

        {filteredStudents.map((s) => {
          const status = getStudentStatus(s, group);
          return (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-xl">{s.name}</div>
                  {s.individualPrice && (
                    <div className="text-xs text-slate-500 mt-1">سعر خاص: {s.individualPrice} دج</div>
                  )}
                </div>
                <span
                  className={`w-16 h-16 flex items-center justify-center rounded-2xl text-2xl font-black shadow-lg ${status.badgeColor}`}
                >
                  {s.sessionsOwed}
                </span>
              </div>

              <div className={`border-2 rounded-2xl px-4 py-4 text-center font-bold shadow-md ${status.boxColor}`}>
                <div className="text-sm mb-1">{status.label}</div>
                <div className="text-2xl">{status.value}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl py-4 text-base font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 group"
                  onClick={() => markPresent(s.id)}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <span className="relative">حضور +1</span>
                </button>
                <button
                  className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl py-4 text-base font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 group"
                  onClick={() => registerPayment(s.id)}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <span className="relative">دفع -{group.sessionsPerMonth}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="bg-slate-100 border-2 border-slate-200 text-slate-700 rounded-xl py-3 text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
                  onClick={() => {
                    const newName = prompt("الاسم الجديد:", s.name);
                    if (!newName) return;
                    const newPriceStr = prompt("السعر الخاص:", s.individualPrice?.toString() ?? "");
                    const newPrice = newPriceStr && newPriceStr.trim() !== "" ? Number(newPriceStr) : null;
                    updateStudent(s.id, { name: newName, individualPrice: newPrice });
                  }}
                >
                  تعديل
                </button>
                <button
                  className="bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-xl py-3 text-sm font-bold hover:bg-rose-100 active:scale-95 transition-all"
                  onClick={() => {
                    if (confirm(`حذف ${s.name}؟`)) deleteStudent(s.id);
                  }}
                >
                  حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========== MAIN APP ==========
const App: React.FC = () => {
  const [groups, setGroups] = useLocalStorage<Group[]>("tm_groups_v2", []);
  const [students, setStudents] = useLocalStorage<Student[]>("tm_students_v2", []);
  const [view, setView] = useState<View>("dashboard");
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  const addGroup = (g: Omit<Group, "id">) => {
    setGroups((prev) => [...prev, { ...g, id: Date.now().toString() }]);
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setStudents((prev) => prev.filter((s) => s.groupId !== id));
  };

  const addStudent = (s: Omit<Student, "id" | "sessionsOwed">) => {
    setStudents((prev) => [...prev, { ...s, id: Date.now().toString(), sessionsOwed: 0 }]);
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const markPresent = (id: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, sessionsOwed: s.sessionsOwed + 1 } : s)));
  };

  const registerPayment = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const group = groups.find((g) => g.id === s.groupId);
          if (group) {
            return { ...s, sessionsOwed: s.sessionsOwed - group.sessionsPerMonth };
          }
        }
        return s;
      })
    );
  };

  const exportData = () => {
    const data = { groups, students };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tuition-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("تم التصدير بنجاح! ✅");
  };

  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.groups && data.students) {
        if (confirm("استبدال البيانات الحالية؟")) {
          setGroups(data.groups);
          setStudents(data.students);
          alert("تم الاستيراد بنجاح! ✅");
        }
      } else {
        alert("ملف غير صالح!");
      }
    } catch {
      alert("خطأ في القراءة!");
    }
  };

  const currentGroup = currentGroupId ? groups.find((g) => g.id === currentGroupId) || null : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-gradient-to-l from-slate-800 to-slate-900 border-b-4 border-emerald-500 shadow-2xl backdrop-blur-lg">
        <div className="max-w-3xl mx-auto px-4 py-5" style={{ direction: "rtl" }}>
          <div className="text-center space-y-1">
            <div className="text-2xl font-black text-white tracking-tight">
              📚 إدارة الدروس الخصوصية
            </div>
            <div className="text-xs text-emerald-300 font-medium">نظام احترافي لتتبع الحضور والمدفوعات</div>
          </div>
        </div>
      </header>

      {view !== "groupDetail" && (
        <nav className="sticky top-[88px] z-40 bg-white/80 backdrop-blur-lg border-b-2 border-slate-200 shadow-lg" style={{ direction: "rtl" }}>
          <div className="max-w-3xl mx-auto px-4 flex gap-2">
            <button
              className={`flex-1 py-4 border-b-4 font-bold transition-all duration-300 ${
                view === "dashboard"
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setView("dashboard")}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🏠</span>
                <span>الرئيسية</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 border-b-4 font-bold transition-all duration-300 ${
                view === "groups"
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setView("groups")}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">👥</span>
                <span>المجموعات</span>
              </div>
            </button>
          </div>
        </nav>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {view === "dashboard" && (
          <Dashboard groups={groups} students={students} goToGroups={() => setView("groups")} />
        )}

        {view === "groups" && (
          <GroupsList
            groups={groups}
            students={students}
            addGroup={addGroup}
            deleteGroup={deleteGroup}
            openGroup={(id) => {
              setCurrentGroupId(id);
              setView("groupDetail");
            }}
            exportData={exportData}
            importData={importData}
          />
        )}

        {view === "groupDetail" && currentGroup && (
          <GroupDetail
            group={currentGroup}
            students={students.filter((s) => s.groupId === currentGroup.id)}
            addStudent={addStudent}
            updateStudent={updateStudent}
            deleteStudent={deleteStudent}
            markPresent={markPresent}
            registerPayment={registerPayment}
            goBack={() => setView("groups")}
          />
        )}
      </main>
    </div>
  );
};

export default App;
