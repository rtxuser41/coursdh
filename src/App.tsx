import React, { useState } from "react";
import FinancialReport from "./components/FinancialReport";
import GroupDetail from "./components/GroupDetail";
import GroupsManagement from "./components/GroupsManagement";
import Home from "./components/Home";
import useLocalStorage from "./hooks/useLocalStorage";
import type { Group, Student, View } from "./types";

function App() {
  const [groups, setGroups] = useLocalStorage<Group[]>("groups_v2", []);
  const [students, setStudents] = useLocalStorage<Student[]>("students_v2", []);
  const [view, setView] = useState<View>("home");
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  const currentGroup = groups.find((g) => g.id === currentGroupId);
  const currentStudents = students.filter((s) => s.groupId === currentGroupId);

  const addGroup = (g: Omit<Group, "id">) => {
    const newGroup: Group = { ...g, id: Date.now().toString(), teacherSessions: 0 };
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
      collected: 0,
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

    const price = student.individualPrice ?? group.monthlyPrice;

    setStudents(
      students.map((s) =>
        s.id === id
          ? {
              ...s,
              sessionsOwed: s.sessionsOwed - group.sessionsPerMonth,
              collected: (s.collected ?? 0) + price,
            }
          : s
      )
    );
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
    if (idx === -1 || groups.length === 0) return;
    const nextIdx = (idx + 1) % groups.length;
    setCurrentGroupId(groups[nextIdx].id);
  };

  const goToPrevGroup = () => {
    const idx = groups.findIndex((g) => g.id === currentGroupId);
    if (idx === -1 || groups.length === 0) return;
    const prevIdx = idx === 0 ? groups.length - 1 : idx - 1;
    setCurrentGroupId(groups[prevIdx].id);
  };

  const incTeacherSessionsForCurrentGroup = () => {
    if (!currentGroupId) return;
    setGroups(
      groups.map((g) => (g.id === currentGroupId ? { ...g, teacherSessions: (g.teacherSessions ?? 0) + 1 } : g))
    );
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
          onIncTeacherSessions={incTeacherSessionsForCurrentGroup}
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
