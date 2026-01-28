import React, { useEffect, useState } from "react";

// ========== TYPES ==========
type View = "dashboard" | "groups" | "groupDetail";

interface Group {
  id: string;
  name: string;
  monthlyPrice: number;
  sessionsPerMonth: number; // NEW: configurable
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
      badgeColor: "bg-rose-100 text-rose-700 border-2 border-rose-300",
      boxColor: "border-rose-300 bg-rose-50 text-rose-700",
      value: debt.toFixed(2) + " دج",
      isDebt: true,
    };
  }

  if (owed < 0) {
    const credit = Math.abs(owed) * unitPrice;
    return {
      label: "رصيد مسبق",
      badgeColor: "bg-emerald-100 text-emerald-700 border-2 border-emerald-300",
      boxColor: "border-emerald-300 bg-emerald-50 text-emerald-700",
      value: credit.toFixed(2) + " دج",
      isDebt: false,
    };
  }

  return {
    label: "منتظم",
    badgeColor: "bg-slate-100 text-slate-700 border-2 border-slate-300",
    boxColor: "border-slate-300 bg-slate-50 text-slate-700",
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
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">لوحة التحكم</h2>
        <p className="text-slate-600 text-sm mt-1">نظرة سريعة على التلاميذ والمالية</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-blue-700 font-semibold">عدد التلاميذ الإجمالي</p>
          <p className="text-4xl font-black text-blue-900 mt-2">{students.length}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-rose-700 font-semibold">إجمالي الديون المستحقة</p>
          <p className="text-3xl font-black text-rose-900 mt-2">{totalDebt.toFixed(2)} دج</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-emerald-700 font-semibold">إجمالي الرصيد المسبق</p>
          <p className="text-3xl font-black text-emerald-900 mt-2">{totalCredit.toFixed(2)} دج</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-slate-700 font-semibold">الصافي (الرصيد - الديون)</p>
          <p className={`text-3xl font-black mt-2 ${net >= 0 ? "text-emerald-900" : "text-rose-900"}`}>
            {net.toFixed(2)} دج
          </p>
        </div>
      </div>

      <button
        onClick={goToGroups}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl py-4 text-lg font-bold shadow-lg active:scale-95 transition-transform"
      >
        الذهاب إلى المجموعات
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
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">المجموعات</h2>
        <p className="text-slate-600 text-sm mt-1">إدارة الأفواج والحصص</p>
      </div>

      {/* Export/Import */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={exportData}
          className="bg-blue-600 text-white rounded-xl py-3 text-sm font-bold shadow-md active:scale-95 transition-transform"
        >
          تصدير البيانات 📥
        </button>
        <button
          onClick={handleImport}
          className="bg-purple-600 text-white rounded-xl py-3 text-sm font-bold shadow-md active:scale-95 transition-transform"
        >
          استيراد البيانات 📤
        </button>
      </div>

      <form className="bg-white border-2 border-slate-300 rounded-2xl p-5 space-y-4 shadow-lg" onSubmit={handleAdd}>
        <div className="text-center font-bold text-slate-900 text-lg">➕ إضافة مجموعة جديدة</div>
        <div>
          <label className="block text-sm text-slate-700 font-semibold mb-2">اسم المجموعة *</label>
          <input
            className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='مثال: "السنة أولى ثانوي"'
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 font-semibold mb-2">السعر الشهري (دج) *</label>
          <input
            type="number"
            className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="2000"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 font-semibold mb-2">عدد الحصص في الشهر *</label>
          <input
            type="number"
            className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
            value={sessions}
            onChange={(e) => setSessions(e.target.value)}
            placeholder="4"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl py-4 text-base font-bold shadow-lg active:scale-95 transition-transform"
        >
          إضافة المجموعة
        </button>
      </form>

      <div className="space-y-4">
        {groups.length === 0 && (
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center text-slate-600">
            لا توجد مجموعات بعد. قم بإضافة مجموعة أعلاه.
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
              className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 rounded-2xl p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-xl">{g.name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {groupStudents.length} تلميذ • {g.monthlyPrice} دج/شهر • {g.sessionsPerMonth} حصص
                  </div>
                </div>
                <button
                  className="px-3 py-1 text-xs rounded-lg bg-rose-100 text-rose-700 font-bold active:scale-95 transition-transform"
                  onClick={() => {
                    if (confirm("حذف هذه المجموعة وكل تلاميذها؟")) deleteGroup(g.id);
                  }}
                >
                  حذف
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-center">
                  <div className="text-xs text-rose-600">ديون المجموعة</div>
                  <div className="font-bold text-rose-700">{groupDebt.toFixed(2)} دج</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
                  <div className="text-xs text-emerald-600">رصيد المجموعة</div>
                  <div className="font-bold text-emerald-700">{groupCredit.toFixed(2)} دج</div>
                </div>
              </div>

              <button
                onClick={() => openGroup(g.id)}
                className="w-full bg-slate-900 text-white rounded-xl py-3 text-base font-bold shadow-md active:scale-95 transition-transform"
              >
                فتح المجموعة ←
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
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center gap-3">
        <button
          className="text-sm text-slate-600 border-2 border-slate-300 rounded-xl px-4 py-2 font-bold active:scale-95 transition-transform"
          onClick={goBack}
        >
          ← رجوع
        </button>
        <h2 className="text-2xl font-bold text-slate-900 flex-1 text-center">{group.name}</h2>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-2xl p-5 text-base shadow-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-slate-600 text-sm">السعر الشهري:</span>
            <div className="font-bold text-slate-900 text-lg">{group.monthlyPrice} دج</div>
          </div>
          <div>
            <span className="text-slate-600 text-sm">عدد الحصص:</span>
            <div className="font-bold text-slate-900 text-lg">{group.sessionsPerMonth} حصة</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t-2 border-slate-300">
          <span className="text-slate-600 text-sm">سعر الحصة الواحدة:</span>
          <div className="font-bold text-emerald-700 text-xl">
            {(group.monthlyPrice / group.sessionsPerMonth).toFixed(2)} دج
          </div>
        </div>
      </div>

      <form className="bg-white border-2 border-slate-300 rounded-2xl p-5 space-y-4 shadow-lg" onSubmit={handleAdd}>
        <div className="text-center font-bold text-slate-900 text-lg">➕ إضافة تلميذ جديد</div>
        <div>
          <label className="block text-sm text-slate-700 font-semibold mb-2">اسم التلميذ *</label>
          <input
            className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: محمد بن يوسف"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 font-semibold mb-2">سعر خاص (اختياري)</label>
          <input
            type="number"
            className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base focus:border-emerald-500 focus:outline-none"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={`الافتراضي: ${group.monthlyPrice} دج`}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl py-4 text-base font-bold shadow-lg active:scale-95 transition-transform"
        >
          إضافة التلميذ
        </button>
      </form>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowDebtOnly(!showDebtOnly)}
          className={`flex-1 rounded-xl py-3 text-sm font-bold shadow-md active:scale-95 transition-transform ${
            showDebtOnly
              ? "bg-rose-600 text-white"
              : "bg-white border-2 border-slate-300 text-slate-700"
          }`}
        >
          {showDebtOnly ? "عرض الكل" : "المدينون فقط"}
        </button>
      </div>

      <div className="space-y-4">
        {filteredStudents.length === 0 && !showDebtOnly && (
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center text-slate-600">
            لا يوجد تلاميذ في هذه المجموعة بعد.
          </div>
        )}
        {filteredStudents.length === 0 && showDebtOnly && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center text-emerald-700 font-bold">
            ممتاز! لا يوجد مدينون حالياً 🎉
          </div>
        )}

        {filteredStudents.map((s) => {
          const status = getStudentStatus(s, group);
          return (
            <div
              key={s.id}
              className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 rounded-2xl p-5 space-y-4 shadow-lg"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-xl">{s.name}</div>
                  {s.individualPrice && (
                    <div className="text-xs text-slate-500 mt-1">سعر خاص: {s.individualPrice} دج</div>
                  )}
                </div>
                <span
                  className={`w-14 h-14 flex items-center justify-center rounded-full text-xl font-black shadow-md ${status.badgeColor}`}
                >
                  {s.sessionsOwed}
                </span>
              </div>

              <div
                className={`border-2 rounded-xl px-4 py-3 text-center font-bold shadow-md ${status.boxColor}`}
              >
                <div className="text-sm">{status.label}</div>
                <div className="text-lg mt-1">{status.value}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl py-4 text-base font-bold shadow-lg active:scale-95 transition-transform"
                  onClick={() => markPresent(s.id)}
                >
                  حضور +1
                </button>
                <button
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl py-4 text-base font-bold shadow-lg active:scale-95 transition-transform"
                  onClick={() => registerPayment(s.id)}
                >
                  دفع -{group.sessionsPerMonth}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="bg-slate-100 border-2 border-slate-300 text-slate-700 rounded-xl py-3 text-sm font-bold active:scale-95 transition-transform"
                  onClick={() => {
                    const newName = prompt("تعديل الاسم:", s.name);
                    if (!newName) return;
                    const newPriceStr = prompt(
                      "تعديل السعر الخاص (اترك فارغاً للسعر الافتراضي):",
                      s.individualPrice?.toString() ?? ""
                    );
                    const newPrice = newPriceStr && newPriceStr.trim() !== "" ? Number(newPriceStr) : null;
                    updateStudent(s.id, { name: newName, individualPrice: newPrice });
                  }}
                >
                  تعديل
                </button>
                <button
                  className="bg-rose-100 border-2 border-rose-300 text-rose-700 rounded-xl py-3 text-sm font-bold active:scale-95 transition-transform"
                  onClick={() => {
                    if (confirm(`حذف التلميذ: ${s.name}؟`)) deleteStudent(s.id);
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
    a.download = `tuition-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("تم تصدير البيانات! 📥");
  };

  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.groups && data.students) {
        if (confirm("هل تريد استبدال البيانات الحالية بالبيانات المستوردة؟")) {
          setGroups(data.groups);
          setStudents(data.students);
          alert("تم استيراد البيانات بنجاح! 📤");
        }
      } else {
        alert("ملف غير صحيح!");
      }
    } catch {
      alert("خطأ في قراءة الملف!");
    }
  };

  const currentGroup = currentGroupId ? groups.find((g) => g.id === currentGroupId) || null : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b-4 border-emerald-500 shadow-xl">
        <div className="max-w-3xl mx-auto px-4 py-4" style={{ direction: "rtl" }}>
          <div className="text-center">
            <div className="text-2xl font-black text-white">📚 نظام إدارة الدروس الخصوصية</div>
            <div className="text-xs text-slate-300 mt-1">تتبع الحضور والمدفوعات بسهولة</div>
          </div>
        </div>
      </header>

      {view !== "groupDetail" && (
        <nav className="bg-white border-b-2 border-slate-200 shadow-md" style={{ direction: "rtl" }}>
          <div className="max-w-3xl mx-auto px-4 flex gap-2 text-base">
            <button
              className={`flex-1 py-4 border-b-4 font-bold transition-all ${
                view === "dashboard"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                  : "border-transparent text-slate-600"
              }`}
              onClick={() => setView("dashboard")}
            >
              🏠 الرئيسية
            </button>
            <button
              className={`flex-1 py-4 border-b-4 font-bold transition-all ${
                view === "groups"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                  : "border-transparent text-slate-600"
              }`}
              onClick={() => setView("groups")}
            >
              👥 المجموعات
            </button>
          </div>
        </nav>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6">
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
