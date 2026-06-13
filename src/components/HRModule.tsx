import React, { useState } from "react";
import { User, Attendance, LeaveRequest, PerformanceReview, Candidate } from "../types";
import { syncERPCollection } from "../utils";
import { Users, FileUser, MapIcon, Calendar, ClipboardCheck, UserCheck, Plus, Clock, Star, MapPin, CheckCircle, XCircle, Edit, Trash2, Key, Award, Briefcase, Mail, Phone, Upload } from "lucide-react";

interface HRModuleProps {
  currentUser: User;
  users: User[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  performanceReviews: PerformanceReview[];
  candidates: Candidate[];
  onDataChanged: () => void;
}

export default function HRModule({
  currentUser,
  users,
  attendance,
  leaveRequests,
  performanceReviews,
  candidates,
  onDataChanged
}: HRModuleProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "recruitment" | "leaves" | "pfr" | "attendance">("directory");

  // Filter out students/clients from HR directory
  const employees = users.filter(u => !["student", "client"].includes(u.role));

  const [newCandidate, setNewCandidate] = useState({ name: "", email: "", phone: "", position: "", status: "interview" as const });

  // Employee CRUD states and functions
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<User | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee" as User["role"],
    avatar: "",
    password: "",
    baseSalary: 8000,
    hireDate: ""
  });

  const handleOpenAddEmployee = () => {
    setSelectedEmp(null);
    setEmployeeForm({
      name: "",
      email: "",
      phone: "",
      role: "employee",
      avatar: "",
      password: "123456", // default safe PIN
      baseSalary: 8000,
      hireDate: new Date().toISOString().substring(0, 7) // e.g. "2026-06"
    });
    setShowEmployeeModal(true);
  };

  const handleOpenEditEmployee = (emp: User) => {
    setSelectedEmp(emp);
    setEmployeeForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      avatar: emp.avatar || "",
      password: emp.password || "123456",
      baseSalary: emp.baseSalary || 8000,
      hireDate: emp.hireDate || "2026-01"
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email || !employeeForm.phone) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    let updatedUsers: User[];

    if (selectedEmp) {
      // Edit mode
      updatedUsers = users.map(u => u.id === selectedEmp.id ? {
        ...u,
        name: employeeForm.name,
        email: employeeForm.email,
        phone: employeeForm.phone,
        role: employeeForm.role,
        avatar: employeeForm.avatar,
        password: employeeForm.password,
        baseSalary: Number(employeeForm.baseSalary),
        hireDate: employeeForm.hireDate
      } : u);
    } else {
      // Add mode
      const newId = `u-${Date.now()}`;
      const newEmp: User = {
        id: newId,
        name: employeeForm.name,
        email: employeeForm.email,
        phone: employeeForm.phone,
        role: employeeForm.role,
        avatar: employeeForm.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150`,
        customPermissions: getRolePermissions(employeeForm.role),
        password: employeeForm.password || "123456",
        baseSalary: Number(employeeForm.baseSalary),
        hireDate: employeeForm.hireDate || new Date().toISOString().substring(0, 7)
      };
      updatedUsers = [...users, newEmp];
    }

    const logText = selectedEmp 
      ? `تحديث بيانات الموظف "${employeeForm.name}" بنجاح.`
      : `إضافة موظف جديد بقاعدة البيانات بالتعيين والتنسيق "${employeeForm.name}".`;

    const success = await syncERPCollection("users", updatedUsers, currentUser.id, currentUser.name, logText);
    if (success) {
      setShowEmployeeModal(false);
      onDataChanged();
    } else {
      alert("عذراً، حدث خطأ أثناء الاتصال بالسيرفر لحفظ بيانات الموظف.");
    }
  };

  const handleDeleteEmployee = async (empId: string, empName: string) => {
    if (empId === currentUser.id) {
      alert("لا يمكنك حذف الحساب النشط الذي تسجل الدخول به حالياً لمراعاة الأمان!");
      return;
    }

    const confirmDelete = window.confirm(`هل أنت متأكد من رغبتك في حذف الموظف "${empName}" نهائياً من سجلات النظام وقاعدة البيانات؟`);
    if (!confirmDelete) return;

    const updatedUsers = users.filter(u => u.id !== empId);
    const success = await syncERPCollection(
      "users", 
      updatedUsers, 
      currentUser.id, 
      currentUser.name, 
      `حذف ملف الموظف "${empName}" من قاعدة البيانات الموحدة.`
    );
    if (success) {
      onDataChanged();
    } else {
      alert("فشل في حذف الموظف، يرجى التحقق من الشبكة ومحاولة المزامنة.");
    }
  };

  const getRolePermissions = (role: User["role"]): string[] => {
    switch(role) {
      case "admin": return ["all"];
      case "marketing_manager": return ["leads", "campaigns", "contracts"];
      case "hr_manager": return ["employees", "attendance", "leaves", "salaries"];
      case "academy_manager": return ["courses", "students", "certificates"];
      case "project_manager": return ["projects", "tasks"];
      case "accountant": return ["transactions", "salaries"];
      case "coach": return ["courses", "attendance"];
      default: return ["tasks", "attendance_self"];
    }
  };

  const getRoleArabicName = (role: string): string => {
    switch(role) {
      case "admin": return "المدير التنفيذي CEO";
      case "marketing_manager": return "مدير التسويق والوكالة";
      case "hr_manager": return "مدير الموارد البشرية HR";
      case "academy_manager": return "مدير المناهج والأكاديمية";
      case "project_manager": return "مدير مشروعات وتصنيع";
      case "accountant": return "المحاسب المالي العام";
      case "coach": return "مدرب / محاضر برمجيات";
      case "employee": return "موظف تسويق وصانع محتوى";
      case "student": return "طالب ملتحق بالأكاديمية";
      case "client": return "العميل الراعي";
      default: return role;
    }
  };
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  // Leave approval simulator
  const handleApproveLeave = async (leaveId: string, level: string) => {
    const updated = leaveRequests.map(lv => {
      if (lv.id === leaveId) {
        let newStatus = lv.status;
        if (level === "level_1") {
          newStatus = "approved_level_1" as const;
        } else if (level === "final") {
          newStatus = "approved" as const;
        }
        return {
          ...lv,
          status: newStatus,
          approverPath: [...(lv.approverPath || []), `${currentUser.name} (${currentUser.role})`]
        };
      }
      return lv;
    });

    const success = await syncERPCollection("leaveRequests", updated, currentUser.id, currentUser.name, `الموافقة على طلب إجازة في مستوى ${level}.`);
    if (success) onDataChanged();
  };

  const handleRejectLeave = async (leaveId: string) => {
    const updated = leaveRequests.map(lv => lv.id === leaveId ? { ...lv, status: "rejected" as const } : lv);
    const success = await syncERPCollection("leaveRequests", updated, currentUser.id, currentUser.name, `رفض طلب الإجازة للموظف.`);
    if (success) onDataChanged();
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.position) return;

    const updated = [
      ...candidates,
      {
        ...newCandidate,
        id: `can-${Date.now()}`,
        testScore: 80,
        interviewNotes: "مرشح متميز للمرحلة القادمة."
      }
    ];

    const success = await syncERPCollection("candidates", updated, currentUser.id, currentUser.name, `إدراج المرشح للتوظيف "${newCandidate.name}".`);
    if (success) {
      setShowCandidateModal(false);
      setNewCandidate({ name: "", email: "", phone: "", position: "", status: "interview" });
      onDataChanged();
    }
  };

  return (
    <div className="space-y-6" id="hr-module-main">
      
      {/* Upper HR Tabs */}
      <div className="flex border-b border-slate-800 gap-1.5 scroll-x-auto">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "directory" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ملفات الموظفين ({employees.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "attendance" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>سجل الحضور والـ GPS</span>
        </button>
        <button
          onClick={() => setActiveTab("leaves")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "leaves" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>الإجازات المعتمدة بمستويات</span>
        </button>
        <button
          onClick={() => setActiveTab("pfr")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "pfr" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>تقييم الأداء OKR & KPI</span>
        </button>
        <button
          onClick={() => setActiveTab("recruitment")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "recruitment" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>التوظيف والمقابلات</span>
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === "directory" && (
        <div className="space-y-4 text-right">
          {/* Sub Header bar with Search & Add Employee Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4 gap-3 shadow-md">
            <div>
              <h3 className="text-xs font-bold text-slate-100 font-sans">ملفات الموظفين المعتمدين</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">إدارة الحسابات، ضبط الرواتب، وتحديث الصلاحيات الأمنية للـ ERP</p>
            </div>
            {currentUser.role === "admin" || currentUser.role === "hr_manager" ? (
              <button
                onClick={handleOpenAddEmployee}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition font-sans font-bold shadow-sm cursor-pointer border-none outline-none"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موظف جديد للمؤسسة</span>
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => (
              <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[8px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                      {getRoleArabicName(emp.role)}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <h3 className="text-xs font-bold text-slate-100 font-sans leading-none">{emp.name}</h3>
                        <span className="text-[9px] text-slate-500 font-mono mt-1 block">{emp.id}</span>
                      </div>
                      <img src={emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-2 bg-slate-950/50 p-3 rounded border border-slate-850 font-sans text-right">
                    <div className="flex justify-between items-center gap-2">
                      <b className="text-slate-200 font-mono">{emp.email}</b>
                      <span className="text-slate-500">البريد الالكتروني:</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <b className="text-slate-200 font-mono">{emp.phone}</b>
                      <span className="text-slate-500">موبايل:</span>
                    </div>
                    {emp.password && (
                      <div className="flex justify-between items-center gap-2 border-t border-slate-800/60 pt-1.5 text-[9px]">
                        <span className="text-indigo-400 font-mono font-bold">{emp.password}</span>
                        <span className="text-slate-500">رمز الدخول PIN:</span>
                      </div>
                    )}
                    <div className="border-t border-slate-800 pt-1.5 mt-1 flex justify-between items-center">
                      <span className="text-emerald-400 font-bold">
                        {(emp.baseSalary || 8000).toLocaleString()} ج.م
                      </span>
                      <span className="text-slate-500">الراتب الأساسي:</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center text-[10px] text-slate-500 font-sans">
                  <span>تاريخ التعيين: {emp.hireDate || "2026-01"}</span>
                  
                  {/* Actions for Authorized HR profiles */}
                  {currentUser.role === "admin" || currentUser.role === "hr_manager" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="text-indigo-400 hover:text-indigo-300 p-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded transition border-none cursor-pointer"
                        title="تعديل بيانات الموظف"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 hover:bg-rose-500/20 rounded transition border-none cursor-pointer"
                        title="حذف الموظف من السيرفر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-indigo-400">ملف معتمد</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance & GPS logs */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 font-sans flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-indigo-400" />
            <span>نظام الحضور والانصراف يسجل تلقائياً إحداثيات GPS وموقع تسجيل العمل عن بعد لضمان الأداء والانضباط.</span>
          </div>

          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <table className="w-full text-right text-xs font-sans">
              <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3">الموظف</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">حضور</th>
                  <th className="p-3">انصراف</th>
                  <th className="p-3">الموقع / GPS المسترجع</th>
                  <th className="p-3">النوع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {attendance.map(att => {
                  const empObj = users.find(u => u.id === att.userId);
                  return (
                    <tr key={att.id} className="hover:bg-slate-850/45 transition">
                      <td className="p-3 font-semibold text-indigo-300">{empObj?.name || "موظف متميز"}</td>
                      <td className="p-3 font-mono text-slate-400">{att.date}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{att.clockIn}</td>
                      <td className="p-3 font-mono text-slate-400">{att.clockOut || "-- : --"}</td>
                      <td className="p-3 text-[11px] text-slate-400 flex items-center justify-end gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="font-mono">{att.latitude ? `${att.latitude.toFixed(4)}, ${att.longitude?.toFixed(4)}` : "مقر المؤسسة الرئيسي"}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded ${
                          att.remote ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {att.remote ? "عن بعد" : "حضوري"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave requests approvals level 1 & final */}
      {activeTab === "leaves" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {leaveRequests.map(lv => {
              const empObj = users.find(u => u.id === lv.userId);
              return (
                <div key={lv.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-sans uppercase font-bold ${
                        lv.status === "approved" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : lv.status === "approved_level_1"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : lv.status === "pending"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {lv.status === "approved" && "معتمدة نهائياً"}
                        {lv.status === "approved_level_1" && "معتمدة مستوى أول"}
                        {lv.status === "pending" && "بانتظار الموافقة"}
                        {lv.status === "rejected" && "مرفوضة من الإدارة"}
                      </span>
                      <span className="text-[10px] bg-slate-950 py-0.5 px-2 rounded font-mono text-indigo-300">
                        {lv.type === "sick" ? "مرضية" : "إجازة سنوية"}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 font-sans text-right">{empObj?.name || "موظف متميز"}</h4>
                    <p className="text-xs text-slate-400 font-sans text-right mt-1">{lv.reason}</p>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono text-right">فترة الأيام المطلوبة: {lv.startDate} إلى {lv.endDate}</div>
                  </div>

                  {/* Multilevel validation control */}
                  {lv.status !== "approved" && lv.status !== "rejected" && (
                    <div className="flex gap-2">
                      {lv.status === "pending" && currentUser.role === "hr_manager" && (
                        <button
                          onClick={() => handleApproveLeave(lv.id, "level_1")}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-[11px] px-3 py-1.5 rounded transition"
                        >
                          اعتماد مستوى أول
                        </button>
                      )}
                      {lv.status === "approved_level_1" && currentUser.role === "admin" && (
                        <button
                          onClick={() => handleApproveLeave(lv.id, "final")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[11px] px-3 py-1.5 rounded transition"
                        >
                          اعتماد نهائي (المدير)
                        </button>
                      )}
                      {["admin", "hr_manager"].includes(currentUser.role) && (
                        <button
                          onClick={() => handleRejectLeave(lv.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-sans text-[11px] px-3 py-1.5 rounded border border-rose-500/20 transition"
                        >
                          رفض الطلب
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Reviews OKRs */}
      {activeTab === "pfr" && (
        <div className="space-y-4 text-right">
          {performanceReviews.map(pfr => {
            const empObj = users.find(u => u.id === pfr.userId);
            return (
              <div key={pfr.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-1">
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 font-sans">{empObj?.name || "الموظف الإبداعي"}</h3>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">فترة التقييم: {pfr.period}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold text-xs font-sans">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>تقييم المدير: {pfr.managerRating || 5}/5</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-850">
                  <div className="text-[10px] font-bold text-indigo-400 font-sans mb-1">أهداف ونتائج رئيسية OKR</div>
                  {pfr.okrsList.map((ok, okidx) => (
                    <div key={okidx} className="text-xs text-slate-300 leading-relaxed font-sans">
                      🎯 {ok.objective}: <span className="text-slate-400 font-medium">{ok.result}</span> <b className="text-slate-200">({ok.progress}%)</b>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-[10px] font-bold text-indigo-400 font-sans mb-1">التقرير الشهري والـ KPI للمعيار</div>
                  <div className="text-xs text-slate-300 font-sans bg-slate-950 p-2.5 rounded border border-slate-850 leading-relaxed italic pr-3 border-r-4 border-r-indigo-500">
                    "{pfr.quarterlyReview}"
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recruitment */}
      {activeTab === "recruitment" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 font-sans">قاعدة بيانات المرشحين والمقابلات لتوسيع وتدريب فريق عمل الأكاديمية والوكالة.</p>
            <button
              onClick={() => setShowCandidateModal(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كارت مرشح جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map(can => (
              <div key={can.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800/60 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 font-sans">{can.name}</h3>
                    <div className="text-[10px] text-indigo-300 mt-1">{can.position}</div>
                  </div>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-sans uppercase font-bold">
                    {can.status === "interview" ? "مقابلة تقنية" : "اختبار عملي"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed text-right bg-slate-950 p-2.5 rounded">{can.interviewNotes}</p>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>هاتف: {can.phone}</span>
                  <span className="text-emerald-400 font-bold">مجموع التقييم: {can.testScore || 80}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* ADD/EDIT EMPLOYEE MODAL */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEmployee} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">
              {selectedEmp ? `تعديل ملف الموظف: ${selectedEmp.name}` : "إضافة موظف جديد بقاعدة الموارد"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">الأسم بالكامل للموظف *</label>
                <input
                  required
                  type="text"
                  value={employeeForm.name}
                  onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  placeholder="مثال: يوسف كمال"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">البريد الإلكتروني *</label>
                  <input
                    required
                    type="email"
                    value={employeeForm.email}
                    onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-sans font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهاتف الجوال *</label>
                  <input
                    required
                    type="text"
                    value={employeeForm.phone}
                    onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">صلاحية النظام والمسمى الوظيفي</label>
                  <select
                    value={employeeForm.role}
                    onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 cursor-pointer font-sans"
                  >
                    <option value="admin"> المدير التنفيذي (CEO)</option>
                    <option value="marketing_manager">مدير التسويق والوكالة</option>
                    <option value="hr_manager">مدير الموارد البشرية HR</option>
                    <option value="academy_manager">مدير المناهج والأكاديمية</option>
                    <option value="project_manager">مدير مشروعات وتصنيع</option>
                    <option value="accountant">محاسب مالي</option>
                    <option value="coach">مدرب / محاضر برمجيات</option>
                    <option value="employee">موظف تسويق وصانع محتوى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رمز الدخول PIN *</label>
                  <input
                    required
                    type="password"
                    maxLength={10}
                    value={employeeForm.password}
                    onChange={e => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                    placeholder="مثال: 123456"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">الراتب الأساسي (ج.م) *</label>
                  <input
                    required
                    type="number"
                    value={employeeForm.baseSalary}
                    onChange={e => setEmployeeForm({ ...employeeForm, baseSalary: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ التعيين (شهرياً)</label>
                  <input
                    type="month"
                    value={employeeForm.hireDate}
                    onChange={e => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-bold">تحميل أو رفع صورة الموظف (الهوية الملونة)</label>
                
                {/* 3D Drag & Drop Container with real image processing/Base64 */}
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEmployeeForm({ ...employeeForm, avatar: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition duration-150 relative flex flex-col items-center justify-center gap-2 ${
                    isDragging 
                      ? "border-indigo-400 bg-indigo-950/40" 
                      : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                  }`}
                  style={{ minHeight: "130px" }}
                >
                  {employeeForm.avatar ? (
                    <div className="flex flex-col items-center gap-2.5 w-full">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-400 shadow-md">
                        <img 
                          src={employeeForm.avatar} 
                          alt="Avatar View" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setEmployeeForm({ ...employeeForm, avatar: "" })}
                          className="absolute inset-0 bg-black/70 hover:bg-black/90 flex items-center justify-center text-rose-300 font-bold text-[10px] transition duration-150"
                          title="إزالة الصورة والرفع مجدداً"
                        >
                          إزالة
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">✓ تم مراجعة ورفع الصورة بنجاح!</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 w-full py-2">
                      <Upload className="w-8 h-8 text-indigo-400 animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-200">اسحب وأفلت صورة الموظف هنا مباشرة</p>
                        <p className="text-[10px] text-slate-400">أو اضغط للملفات من جهازك</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEmployeeForm({ ...employeeForm, avatar: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                
                {/* Fallback option in case they prefer a URL link */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-500 block text-right select-none">
                    أو لصق رابط خارجي اختياري بديل:
                  </span>
                  <input
                    type="text"
                    value={employeeForm.avatar && !employeeForm.avatar.startsWith("data:") ? employeeForm.avatar : ""}
                    onChange={e => setEmployeeForm({ ...employeeForm, avatar: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full mt-1 bg-slate-950/30 border border-slate-850 rounded-lg py-1 px-2.5 text-slate-400 font-mono text-[9px] text-left outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer border-none outline-none">
                {selectedEmp ? "حفظ التعديلات" : "إضافة للعمل اليومي"}
              </button>
              <button type="button" onClick={() => setShowEmployeeModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer border-none outline-none">
                إلغاء الحفظ
              </button>
            </div>
          </form>
        </div>
      )}

      {showCandidateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddCandidate} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إدراج مرشح جديد بقاعدة الموارد البشرية</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">الاسم بالكامل</label>
                <input required type="text" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">الوظيفة المستهدفة</label>
                <input required type="text" value={newCandidate.position} onChange={e => setNewCandidate({...newCandidate, position: e.target.value})} placeholder="مثال: مطور ويب، مصمم هوية" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">البريد الإلكتروني</label>
                  <input required type="email" value={newCandidate.email} onChange={e => setNewCandidate({...newCandidate, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهاتف</label>
                  <input required type="text" value={newCandidate.phone} onChange={e => setNewCandidate({...newCandidate, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">إضافة لقاعدة التصفية</button>
              <button type="button" onClick={() => setShowCandidateModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
