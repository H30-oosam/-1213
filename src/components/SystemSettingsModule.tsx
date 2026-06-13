import React, { useState } from "react";
import { ERPConfig, AuditLog, User } from "../types";
import { syncERPConfig, requestBackupDB, syncERPCollection } from "../utils";
import { Settings, Shield, HardDrive, Database, ListCollapse, Key, Plus, RefreshCw, FileText } from "lucide-react";

interface SystemSettingsModuleProps {
  currentUser: User;
  systemConfig: ERPConfig;
  auditLogs: AuditLog[];
  users: User[];
  onDataChanged: () => void;
}

export default function SystemSettingsModule({
  currentUser,
  systemConfig,
  auditLogs,
  users,
  onDataChanged
}: SystemSettingsModuleProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<"general" | "roles" | "backups" | "audit">("general");

  // General config form states
  const [configForm, setConfigForm] = useState<ERPConfig>({ ...systemConfig });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Admin password change states
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // New User / custom role states
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    permissions: [] as string[]
  });

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);
    
    if (adminPasswordForm.newPassword.length < 4) {
      setPasswordChangeMessage({ type: "error", text: "يجب أن لا تقل كلمة المرور الجديدة عن 4 خانات لسلامة الأمان" });
      return;
    }
    
    if (adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword) {
      setPasswordChangeMessage({ type: "error", text: "كلمتا المرور غير متطابقتين" });
      return;
    }
    
    setIsSavingPassword(true);
    
    // Find the admin user in users list
    const adminIndex = users.findIndex(u => u.email === "admin@erp.com" || u.role === "admin");
    if (adminIndex === -1) {
      setPasswordChangeMessage({ type: "error", text: "لم يتم العثور على حساب المدير المعتمد بالنظام." });
      setIsSavingPassword(false);
      return;
    }
    
    const adminUser = users[adminIndex];
    const oldPassword = adminUser.password || "123456";
    
    if (adminPasswordForm.currentPassword !== oldPassword) {
      setPasswordChangeMessage({ type: "error", text: "رمز الدخول الحالي غير صحيح لمطابقة الهوية" });
      setIsSavingPassword(false);
      return;
    }
    
    const updatedUsers = [...users];
    updatedUsers[adminIndex] = {
      ...adminUser,
      password: adminPasswordForm.newPassword
    };
    
    const success = await syncERPCollection(
      "users", 
      updatedUsers, 
      currentUser.id, 
      currentUser.name, 
      `تعديل وتحديث كلمة المرور السرية (PIN) للمدير (admin@erp.com) من لوحة التحكم بنجاح.`
    );
    
    if (success) {
      setPasswordChangeMessage({ type: "success", text: "✓ تم تحديث كلمة مرور المدير بنجاح في السيرفر السحابي!" });
      setAdminPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onDataChanged();
    } else {
      setPasswordChangeMessage({ type: "error", text: "فشل تحديث كلمة المرور في السيرفر السحابي. يرجى المحاولة لاحقاً." });
    }
    
    setIsSavingPassword(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);

    const success = await syncERPConfig(configForm, currentUser.id, currentUser.name);
    if (success) {
      onDataChanged();
    }
    setIsSavingConfig(false);
  };

  const handleDownloadBackup = async () => {
    const rawDB = await requestBackupDB();
    if (rawDB) {
      const blob = new Blob([JSON.stringify(rawDB, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Hossam_Elwardany_Backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const updatedUsers = [
      ...users,
      {
        ...newUser,
        id: `u-${Date.now()}`,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
      }
    ];

    const success = await syncERPCollection("users", updatedUsers, currentUser.id, currentUser.name, `إنشاء مستخدم مخصص جديد "${newUser.name}" بصلاحيات مبرمجة.`);
    if (success) {
      setShowUserModal(false);
      setNewUser({ name: "", email: "", phone: "", role: "employee", permissions: [] });
      onDataChanged();
    }
  };

  return (
    <div className="space-y-6 text-right" id="system-settings-viewport">
      
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 scroll-x-auto">
        <button
          onClick={() => setActiveSettingsTab("general")}
          className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeSettingsTab === "general" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>المتغيرات الأساسية والإشعارات</span>
        </button>
        <button
          onClick={() => setActiveSettingsTab("roles")}
          className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeSettingsTab === "roles" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>إدارة الصلاحيات والمستخدمين ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveSettingsTab("backups")}
          className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeSettingsTab === "backups" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>النسخ الاحتياطي التلقائي ومكاني الأمن</span>
        </button>
        <button
          onClick={() => setActiveSettingsTab("audit")}
          className={`flex items-center gap-1.5 py-2.5 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeSettingsTab === "audit" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <ListCollapse className="w-4 h-4" />
          <span>سجل العمليات والتدقيق الموثق ({auditLogs.length})</span>
        </button>
      </div>

      {/* 1. General Config Tab */}
      {activeSettingsTab === "general" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-850 pb-2 mb-2">إعدادات النظام العامة وتكامل الـ API</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">اسم نظام الـ ERP السحابي</label>
                <input
                  type="text"
                  value={configForm.appName}
                  onChange={e => setConfigForm({ ...configForm, appName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">تردد النسخ الاحتياطي السحابي التلقائي</label>
                <select
                  value={configForm.backupFrequency}
                  onChange={e => setConfigForm({ ...configForm, backupFrequency: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none"
                >
                  <option value="daily">يومي تلقائي (آمن)</option>
                  <option value="weekly">أسبوعي</option>
                  <option value="monthly">شهري</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">رابط الهوك لتنبيهات الـ WhatsApp API Key</label>
                <input
                  type="text"
                  value={configForm.whatsappCallbackUrl}
                  onChange={e => setConfigForm({ ...configForm, whatsappCallbackUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-left font-mono focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">يُستعمل للربط المباشر مع Meta API لإصدار الحزم تلقائياً.</p>
              </div>
              <div className="space-y-3">
                <label className="block text-slate-400 font-sans">تدابير الأمان وتشفير قواعد البيانات</label>
                <label className="flex items-center gap-2 justify-end text-slate-300 font-sans cursor-pointer">
                  <span>تفعيل تشفير البيانات الحساسة (SHA-256)</span>
                  <input
                    type="checkbox"
                    checked={configForm.isDatabaseEncrypted}
                    onChange={e => setConfigForm({ ...configForm, isDatabaseEncrypted: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-start pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-5 rounded-lg transition"
              >
                {isSavingConfig ? "جاري الحفظ والتوثيق..." : "حفظ التغييرات الأساسية"}
              </button>
            </div>
          </form>

          {/* New Admin Password Update Form */}
          <form onSubmit={handleUpdateAdminPassword} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-850 pb-2 mb-2 flex items-center gap-1.5 justify-end">
              <Key className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>تغيير رمز الدخول وكلمة المرور للمدير (CEO / Admin)</span>
            </h3>
            
            <p className="text-xs text-slate-400 font-sans leading-relaxed text-right">
              تغيير الرقم السري (PIN / Password) الخاص بحساب المدير الرئيسي <span className="text-indigo-400 font-bold">admin@erp.com</span> للمحافظة على أمان وموثوقية النظام السحابي.
            </p>

            {passwordChangeMessage && (
              <div className={`p-3 rounded-xl text-xs font-sans text-right border ${
                passwordChangeMessage.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                {passwordChangeMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">رمز الدخول الحالي (PIN)</label>
                <input
                  required
                  type="password"
                  value={adminPasswordForm.currentPassword}
                  onChange={e => setAdminPasswordForm({ ...adminPasswordForm, currentPassword: e.target.value })}
                  placeholder="رمز الدخول الحالي (مثال: 123456)"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">رمز الدخول الجديد</label>
                <input
                  required
                  type="password"
                  value={adminPasswordForm.newPassword}
                  onChange={e => setAdminPasswordForm({ ...adminPasswordForm, newPassword: e.target.value })}
                  placeholder="الرموز الجديدة (على الأقل 4 رموز)"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">تأكيد رمز الدخول الجديد</label>
                <input
                  required
                  type="password"
                  value={adminPasswordForm.confirmPassword}
                  onChange={e => setAdminPasswordForm({ ...adminPasswordForm, confirmPassword: e.target.value })}
                  placeholder="أعد كتابة الرمز الجديد لتأكيد المطابقة"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-start pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-5 rounded-lg transition"
              >
                {isSavingPassword ? "جاري التحديث والتأمين..." : "تحديث الرمز السري للمدير"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Custom Permissions and Users */}
      {activeSettingsTab === "roles" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
            <h3 className="text-sm font-bold text-slate-100">سجل المستخدمين والصلاحيات المخصصة</h3>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج مستخدم بصلاحية معينة</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="pb-2">الاسم</th>
                  <th className="pb-2">البريد المعتمد</th>
                  <th className="pb-2">المستوى / الدور الوظيفي</th>
                  <th className="pb-2 font-mono">رقم التواصل للـ WhatsApp</th>
                  <th className="pb-2">حيز الصلاحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-2.5 font-sans font-medium">{u.name}</td>
                    <td className="py-2.5 font-mono text-slate-400">{u.email}</td>
                    <td className="py-2.5 font-sans">
                      <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-300 uppercase font-bold text-xxs font-mono">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-400">{u.phone || "--"}</td>
                    <td className="py-2.5 font-sans text-slate-300">
                      {["admin", "hr_manager"].includes(u.role) ? "وصول شامل للمدراء" : "وصول تخصصي محدود"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Database backups engine */}
      {activeSettingsTab === "backups" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-1.5 justify-end">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>أدوات النسخ الاحتياطي السحابي والأمان</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              يدعم نظام الورداني هجرة البيانات بنظام JSON. يمكنك في أي وقت سحب لقطة كاملة لقاعدة البيانات الحية للمبيعات والموظفين والكورسات والاحتفاظ بها لضمان استمرارية الأعمال.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-sans py-2.5 px-4 rounded-lg font-bold transition whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحميل نسخة احتياطية فوراً (.JSON)</span>
          </button>
        </div>
      )}

      {/* 4. Audit Log */}
      {activeSettingsTab === "audit" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-1">
            <h3 className="text-xs font-bold text-slate-100 font-sans">سجل العمليات والتدقيق التاريخي للعمليات المنجزة</h3>
            <span className="text-[10px] text-slate-500 font-mono">خاضع للتشفير</span>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-slate-950 p-3 rounded border border-slate-850 text-xs font-sans text-right hover:border-slate-800 transition">
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5">
                  <span className="font-mono">{log.timestamp}</span>
                  <span className="text-indigo-400 font-bold">{log.userName} ({log.userId})</span>
                </div>
                <div className="text-slate-200">{log.action} {log.details ? ` - ${log.details}` : ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddUser} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إدراج وإسناد مستخدم جديد بالمنظومة</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">الاسم الكامل</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">البريد الإلكتروني</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الدور الوظيفي / الصلاحية</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-indigo-500 text-right">
                    <option value="admin">مدير النظام (كامل الصلاحيات)</option>
                    <option value="marketing_manager">مدير التسويق والعملاء</option>
                    <option value="hr_manager">مدير الموارد البشرية والرواتب</option>
                    <option value="academy_manager">مدير الأكاديمية والشهادات</option>
                    <option value="employee">موظف عادي</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف للـ WhatsApp</label>
                <input required type="text" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">إنشاء وتطبيق</button>
              <button type="button" onClick={() => setShowUserModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
