import React, { useState } from "react";
import type { Group, Student } from "../types";
import { getStatusColor, sortStudentsArabic } from "../utils/students";

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
  onIncTeacherSessions: () => void;
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
  onIncTeacherSessions,
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

        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 mb-1">عدد حصص الأستاذ لهذه المجموعة</div>
            <div className="text-2xl font-black text-emerald-700">{group.teacherSessions ?? 0} حصة</div>
          </div>
          <button
            onClick={onIncTeacherSessions}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl px-4 py-3 text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            ➕ إضافة حصة
          </button>
        </div>

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

export default GroupDetail;
