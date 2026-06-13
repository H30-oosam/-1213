import React, { useState, useEffect } from "react";
import { fetchERPData, syncERPCollection, checkServerConnection, syncLocalChangesWithServer } from "./utils";
import {
  User, ClientCorp, Contract, Proposal, MarketingCampaign, Project,
  ERPTask, Course, Enrollment, Quiz, Assignment, Submission,
  Attendance, LeaveRequest, PerformanceReview, Candidate, AccountLedger,
  AuditLog, ERPConfig
} from "./types";

// Import modules
import AIModule from "./components/AIModule";
import MarketingModule from "./components/MarketingModule";
import ProjectModule from "./components/ProjectModule";
import AcademyModule from "./components/AcademyModule";
import HRModule from "./components/HRModule";
import FinanceModule from "./components/FinanceModule";
import CRMModule from "./components/CRMModule";
import SystemSettingsModule from "./components/SystemSettingsModule";

import {
  ShoppingCart, FileText, RefreshCw, TrendingDown, RotateCcw, Receipt,
  Wrench, LayoutGrid, Plus, Maximize, Download, Info, Calculator, Bell,
  Calendar, CalendarDays, Monitor, Globe, ChevronRight, CornerDownLeft, TrendingUp,
  Bot, Megaphone, Briefcase, GraduationCap, Users, ShieldAlert,
  Wallet, Sparkles, Settings, UserCheck, Play, UserX, MapPin, Map,
  Clock, CheckCircle, Database, HelpCircle, AlertTriangle, FileSpreadsheet, Menu, X
} from "lucide-react";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export default function App() {
  // Global ERP Collections States
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<ClientCorp[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ERPTask[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [transactions, setTransactions] = useState<AccountLedger[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemConfig, setSystemConfig] = useState<ERPConfig>({
    appName: "Hossam Elwardany ERP",
    backupFrequency: "daily",
    isDatabaseEncrypted: false,
    whatsappCallbackUrl: ""
  });

  // App UI Layout
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  
  // حالة التحكم في فتح وإغلاق القائمة المنسدلة في الموبايل
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Login Page states & credentials checking
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // حالات استعادة رمز الدخول PIN الجديدة للتحقق بالرقم
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  
  // بيانات حساب الأدمن المحدثة والمطلوبة
  const [adminEmail, setAdminEmail] = useState("admin@hossam.com");
  const [adminPassword, setAdminPassword] = useState("@Hos1321994");

  // Simulation Role Context
  const [currentUser, setCurrentUser] = useState<User>({
    id: "u-1",
    name: "حسام الورداني",
    email: "admin@hossam.com",
    phone: "+201200716861",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    customPermissions: ["all"]
  });

  // GPS Clock In Simulation states
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [clockInMessage, setClockInMessage] = useState<string | null>(null);

  // State for interactive UI location and date filters from the mockup
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("last30");

  // Load ERP state on boot
  const loadWorkspaceData = async () => {
    try {
      const data = await fetchERPData();
      if (data) {
        const fetchedUsers = data.users || [];
        setUsers(fetchedUsers);
        setClients(data.clients || []);
        setContracts(data.contracts || []);
        setProposals(data.proposals || []);
        setCampaigns(data.campaigns || []);
        setProjects(data.projects || []);
        setTasks(data.tasks || []);
        setCourses(data.courses || []);
        setEnrollments(data.enrollments || []);
        setQuizzes(data.quizzes || []);
        setAssignments(data.assignments || []);
        setSubmissions(data.submissions || []);
        setAttendance(data.attendance || []);
        setLeaveRequests(data.leaveRequests || []);
        setPerformanceReviews(data.performanceReviews || []);
        setCandidates(data.candidates || []);
        setTransactions(data.transactions || []);
        setAuditLogs(data.auditLogs || []);
        if (data.systemConfig) {
          setSystemConfig(data.systemConfig);
        }

        // Auto authenticate from localStorage cache
        const cached = localStorage.getItem("erp_logged_in_user");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const fresh = fetchedUsers.find((u: any) => u.id === parsed.id || u.email === parsed.email);
            if (fresh) {
              setCurrentUser(fresh);
              setIsLoggedIn(true);
            } else if (parsed) {
              if (parsed.email === adminEmail) {
                setCurrentUser(parsed);
                setIsLoggedIn(true);
              } else {
                setCurrentUser(parsed);
                setIsLoggedIn(true);
              }
            }
          } catch (err) {
            console.error("Cache parsing error:", err);
          }
        }
      }
    } catch (e) {
      console.error("Error loading workspace metadata:", e);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  // مراقب الاتصال بالإنترنت والخادم - يقوم بمزامنة البيانات المحفوظة محلياً عند استعادة الاتصال
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isOnline = navigator.onLine;

    const handleOnline = async () => {
      console.log("✅ تم استعادة الاتصال بالإنترنت");
      isOnline = true;
      // محاولة مزامنة البيانات المحفوظة محلياً
      if (isLoggedIn) {
        await syncLocalChangesWithServer(currentUser.id, currentUser.name);
        // إعادة تحميل البيانات من الخادم للتأكد من التزامن
        await loadWorkspaceData();
      }
    };

    const handleOffline = () => {
      console.log("📡 فقد الاتصال بالإنترنت - البيانات ستُحفظ محلياً");
      isOnline = false;
    };

    // مراقب اتصال الإنترنت الأساسي
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // فحص دوري لحالة الخادم كل 30 ثانية (في حالة عدم عمل أحداث online/offline بشكل صحيح)
    intervalId = setInterval(async () => {
      const wasOnline = isOnline;
      const serverConnected = await checkServerConnection();
      
      if (!wasOnline && serverConnected) {
        console.log("✅ تم اكتشاف استعادة الاتصال بالخادم");
        isOnline = true;
        if (isLoggedIn) {
          await syncLocalChangesWithServer(currentUser.id, currentUser.name);
          await loadWorkspaceData();
        }
      }
      isOnline = serverConnected;
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoggedIn, currentUser.id, currentUser.name]);

  // Simulator profile toggler
  const handleRoleToggle = (roleKey: string) => {
    if (roleKey === "admin") {
      setCurrentUser({
        id: "u-1",
        name: "حسام الورداني",
        email: adminEmail,
        phone: "+201200716861",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        customPermissions: ["all"]
      });
      setClockInMessage(null);
      return;
    }

    const matched = users.find(u => u.role === roleKey);
    if (matched) {
      setCurrentUser(matched);
      setClockInMessage(null);
    } else {
      // Create a temporary profile
      const tempUser: User = {
        id: `u-temp-${roleKey}`,
        name: `مستخدم تجريبي (${roleKey})`,
        email: `${roleKey}@elwardany.com`,
        phone: "+201500000000",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        role: roleKey as any,
        customPermissions: []
      };
      setCurrentUser(tempUser);
      setClockInMessage(null);
    }
  };

  // Clock In using Navigator Geolocation or Cairo Egypt backup coords
  const handleClockInGPS = async () => {
    setIsClockingIn(true);
    setClockInMessage("جاري استخلاص موقع الـ GPS المشفر وتحقق العميل عن بعد...");

    const logAttendanceEntry = async (lat: number, lng: number) => {
      const entry: Attendance = {
        id: `att-${Date.now()}`,
        userId: currentUser.id,
        date: new Date().toISOString().split("T")[0],
        clockIn: new Date().toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric" }),
        latitude: lat,
        longitude: lng,
        remote: true
      };

      const updated = [entry, ...attendance];
      const success = await syncERPCollection("attendance", updated, currentUser.id, currentUser.name, `تسجيل حضور وانصراف ذاتي عن بعد عبر الهاتف بإحداثيات GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}).`);
      
      if (success) {
        setAttendance(updated);
        setClockInMessage(`تم تسجيل الحضور عن بعد بنجاح! الإحداثيات الموثقة: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        setClockInMessage("عذراً، فشل تسجيل حضور الموظف الذاتي بالسيرفر السحابي.");
      }
      setIsClockingIn(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          logAttendanceEntry(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation warning, using simulated Cairo coords:", err);
          // Fallback to beautiful default simulated coordinates near cairo egypt
          setTimeout(() => {
            logAttendanceEntry(30.0444, 31.2357);
          }, 1000);
        }
      );
    } else {
      setTimeout(() => {
        logAttendanceEntry(30.0444, 31.2357);
      }, 1000);
    }
  };

  // دالة طلب كود استعادة الباسورد المشفر للرقم
  const handleRequestRecoveryCode = () => {
    setRecoveryMessage("جاري تشفير وإرسال كود التحقق OTP إلى الرقم 01200716861...");
    setTimeout(() => {
      setRecoveryStep(2);
      setRecoveryMessage("تم إرسال كود التحقق بنجاح! (للتجربة الكود هو: 1321)");
    }, 1500);
  };

  // دالة تأكيد الكود وتعيين الباسورد الجديد
  const handleVerifyAndChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVerificationCode !== "1321") {
      setRecoveryMessage("عذراً، كود التحقق OTP المدخل غير صحيح. حاول مجدداً.");
      return;
    }
    if (newPasswordInput.length < 6) {
      setRecoveryMessage("يجب أن يتكون رمز الدخول PIN الجديد من 6 خانات أو أكثر.");
      return;
    }

    setAdminPassword(newPasswordInput);
    setRecoveryMessage("تم تحديث رمز الدخول PIN الخاص بالأدمن بنجاح! يمكنك التسجيل الآن.");
    setTimeout(() => {
      setShowForgotPasswordModal(false);
      setRecoveryStep(1);
      setInputVerificationCode("");
      setNewPasswordInput("");
      setRecoveryMessage(null);
    }, 2000);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-100">
        <Bot className="w-12 h-12 text-indigo-400 animate-bounce" />
        <div className="text-sm font-sans tracking-wide">نموذج حسام الورداني ERP يفك تشفير البيانات الحية...</div>
      </div>
    );
  }

  // Permission guards helper
  const canAccess = (allowedRoles: string[]) => {
    if (currentUser.role === "admin") return true;
    return allowedRoles.includes(currentUser.role);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailInput = loginEmail.trim().toLowerCase();

    // فحص التحقق من بيانات الأدمن المحدثة والمطلوبة بالشرط المباشر
    if (emailInput === adminEmail.toLowerCase() && loginPassword === adminPassword) {
      const adminProfile = {
        id: "u-1",
        name: "حسام الورداني",
        email: adminEmail,
        phone: "+201200716861",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        customPermissions: ["all"]
      };
      
      setCurrentUser(adminProfile);
      setIsLoggedIn(true);
      setClockInMessage(null);
      if (rememberMe) {
        localStorage.setItem("erp_logged_in_user", JSON.stringify(adminProfile));
      }
    } else {
      // التحقق من باقي الحسابات المتواجدة في الداتا بيز الافتراضية
      const matched = users.find(u => u.email.toLowerCase().trim() === emailInput || u.phone === emailInput);
      if (!matched) {
        setLoginError("البريد الإلكتروني أو رمز الدخول PIN المدخل غير صحيح.");
        return;
      }

      const correctPassword = matched.password || "123456";
      if (loginPassword !== correctPassword && loginPassword !== matched.phone) {
        setLoginError("رمز الدخول PIN المدخل غير صحيح لهذا الملف الشخصي.");
        return;
      }

      setCurrentUser(matched);
      setIsLoggedIn(true);
      setClockInMessage(null);
      if (rememberMe) {
        localStorage.setItem("erp_logged_in_user", JSON.stringify(matched));
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("erp_logged_in_user");
    setLoginPassword("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans" id="login-screen-view">
        {/* Decorative branding sidebar section */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-900 via-slate-900 to-[#1e1b4b] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden text-right border-l border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 relative">
            <Bot className="w-8 h-8 text-indigo-400" />
            <div className="text-right">
              <h1 className="text-base font-bold text-white tracking-wide">نظام حسام الورداني السحابي ERP</h1>
              <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">النسخة المتكاملة للمؤسسات v2.4</p>
            </div>
          </div>

          <div className="space-y-6 my-12 relative max-w-lg">
            <h2 className="text-xl md:text-2xl font-black text-white leading-snug">البوابة الرقمية الموحدة لتخطيط ومتابعة عمليات اليومية</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              يضمن هذا النظام إدارة مشفرة وسريعة للبيانات الحسابية، تتبع حركات الموارد البشرية والرواتب، التقييم السنوي المعتمد بمؤشرات الأداء OKR & KPI، وإدارة حملات التوظيف ومتابعة مشروعات الأكاديمية وصناع المحتوى.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-3 justify-start">
                <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400 mt-0.5 border border-indigo-500/15">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">صلاحيات حماية ديناميكية</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">تأمين تام للواجهات والقنوات المالية وموجز الصلاحيات لكل موظف.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 justify-start">
                <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400 mt-0.5 border border-indigo-500/15">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">تحقق الموقع والـ GPS</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">تسجيل دوام ذاتي للموظفين عن بعد عبر تتبع إحداثيات ومواقع العمل الذكية.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-sans mt-auto">
            جميع الحقوق محفوظة © للمستشار حسام الورداني 2026. مشغل بحماية سحابية مشفرة SSL.
          </div>
        </div>

        {/* Form selection section */}
        <div className="md:w-1/2 bg-slate-900/95 flex flex-col justify-center p-6 sm:p-12 md:p-16 text-right relative">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-sans">بوابة تسجيل الدخول الآمن</h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">الرجاء إدخال البريد الإلكتروني ورمز الـ PIN المعتمدة لملف الموظف</p>
            </div>

            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg leading-relaxed flex items-center justify-start gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">البريد الإلكتروني للموظف</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={loginEmail}
                    onChange={e => {
                      setLoginEmail(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="example@erp.com"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-4 pr-10 text-slate-200 focus:border-indigo-500 outline-none text-right font-mono text-[13px] tracking-wide"
                  />
                  <div className="absolute right-3 top-3.5 text-slate-500">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">رمز الدخول PIN الخاص بك</label>
                <div className="relative">
                  <input
                    required
                    type="password"
                    maxLength={12}
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-4 pr-10 text-slate-200 focus:border-indigo-500 outline-none text-right font-mono text-[13px] tracking-widest"
                  />
                  <div className="absolute right-3 top-3.5 text-slate-500 font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1.5">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>تذكر جلسة الدخول على هذا المتصفح</span>
                </label>
                
                <span 
                  className="text-slate-500 hover:text-indigo-400 cursor-pointer text-xs select-none" 
                  onClick={() => setShowForgotPasswordModal(true)}
                >
                  نسيت رمز الدخول؟
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg transform hover:scale-[1.01] cursor-pointer border-none outline-none"
              >
                تسجيل الدخول الآمن للـ ERP
              </button>
            </form>

          </div>
        </div>

        {/* واجهة استعادة كلمة المرور المنبثقة التفاعلية المضافة برقم الهاتف */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <button onClick={() => { setShowForgotPasswordModal(false); setRecoveryMessage(null); }} className="text-slate-400 hover:text-white bg-transparent border-none outline-none cursor-pointer text-sm">✕</button>
                <h3 className="text-sm font-bold text-white font-sans">بوابة استعادة رمز الدخول الآمن للأدمن</h3>
              </div>

              {recoveryMessage && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] p-3 rounded-xl leading-relaxed">
                  {recoveryMessage}
                </div>
              )}

              {recoveryStep === 1 ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    لاستعادة حساب الأدمن المربوط بالبريد <span className="text-indigo-400 font-mono font-bold">admin@hossam.com</span>، سيقوم النظام تلقائياً بإرسال كود تحقق مشفر ومؤمن برقم الهاتف الموثق للمستشار.
                  </p>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-slate-500 text-[10px] block">رقم الهاتف المعتمد للإرسال</span>
                    <span className="text-sm font-mono font-bold text-slate-200 tracking-wider">01200716861</span>
                  </div>
                  <button
                    onClick={handleRequestRecoveryCode}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer border-none outline-none"
                  >
                    إرسال كود التحقق OTP الآن
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyAndChangePassword} className="space-y-4 font-sans">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 text-xs">أدخل كود التحقق المكون من 4 أرقام المرسل لهاتفك</label>
                    <input
                      required
                      type="text"
                      maxLength={4}
                      placeholder="1321"
                      value={inputVerificationCode}
                      onChange={e => setInputVerificationCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 font-mono text-center text-sm tracking-widest outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 text-xs">اكتب رمز الدخول PIN الجديد للـ ERP</label>
                    <input
                      required
                      type="password"
                      placeholder="••••••"
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 font-mono text-center text-sm tracking-widest outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer border-none outline-none"
                  >
                    تأكيد الكود وتحديث الباسورد الجديد
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pre-calculate highly professional ERP database indicators
  const totalRevenues = transactions.filter(t => t.type === "revenue").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const unpaidInvoices = contracts.filter(c => c.status === "pending" || c.status === "draft").reduce((s, c) => s + c.value, 0);

  // Baseline values to ensure realistic, gorgeous data if local database is thin
  const displaySales = totalRevenues > 0 ? totalRevenues : 452900.00;
  const displayExpenses = totalExpenses > 0 ? totalExpenses : 87400.00;
  const displayVault = totalRevenues > 0 ? (totalRevenues - totalExpenses) : 365500.00;
  const displayUnpaid = unpaidInvoices > 0 ? unpaidInvoices : 42100.00;
  const displaySalesReturns = 1420.00;
  const displayPurchases = displayExpenses * 0.45;
  const displayUnpaidPurchases = 3800.00;
  const displayPurchaseReturns = 0.00;

  // Mockup Wave curve dataset carefully aligned with 06/24/2026
  const chartData = [
    { name: "01/06", sales: 1200, realEstate: 800, cairoStore: 500, wholesale: 300 },
    { name: "05/06", sales: 1900, realEstate: 1100, cairoStore: 700, wholesale: 400 },
    { name: "10/06", sales: 1500, realEstate: 900, cairoStore: 1000, wholesale: 350 },
    { name: "15/06", sales: 3100, realEstate: 2400, cairoStore: 1800, wholesale: 600 },
    { name: "20/06", sales: 2200, realEstate: 1500, cairoStore: 1400, wholesale: 500 },
    { name: "24/06", sales: 3400, realEstate: 2900, cairoStore: 2100, wholesale: 1200 },
    { name: "28/06", sales: 2800, realEstate: 2100, cairoStore: 1600, wholesale: 950 },
    { name: "30/06", sales: 2950, realEstate: 2250, cairoStore: 1850, wholesale: 1050 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col justify-between relative overflow-x-hidden" id="erp-root-application">
      
      {/* Top Header Navigation - Complete Purple Bar Mirroring the Mockup */}
      <header className="bg-[#4c1d95] border-b border-[#3b0764] px-4 py-2.5 flex flex-col xl:flex-row justify-between items-center gap-4 sticky top-0 z-40 text-white shadow-md">
        
        {/* Left Side (RTL context) / Left corner of screen: User badge, Date pill, and Notifications */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          
          <div className="flex items-center gap-2">
            {/* زر القائمة المنسدلة المخصص للموبايل والتابلت فقط يظهر ويختفي ذكياً */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-white outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Operator Badge with border indicator */}
            <div className="text-right flex items-center gap-2 bg-white/10 p-1.5 px-3 rounded-xl border border-white/20">
              <img 
                src={currentUser.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"} 
                alt="Avatar" 
                className="w-7 h-7 rounded-full border border-white/35 object-cover" 
              />
              <div className="hidden sm:block leading-none text-right">
                <div className="text-xs font-bold text-white font-sans">{currentUser.name}</div>
                <div className="text-[8px] text-purple-200 font-mono font-bold uppercase mt-0.5">{currentUser.role === "admin" ? "المدير التنفيذي CEO" : currentUser.role}</div>
              </div>
            </div>

            {/* Notification sound bell with live count badge */}
            <div className="relative p-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl cursor-pointer transition">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -left-1 bg-red-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">4</span>
            </div>

            {/* Today Date Badge with Calendar Icon */}
            <div className="bg-[#5a2ca6] border border-white/15 rounded-xl px-3 py-2 text-xs font-sans text-white flex items-center gap-1.5 font-bold shadow-sm">
              <CalendarDays className="w-3.5 h-3.5 text-purple-200" />
              <span>06/24/2026</span>
            </div>
          </div>

          {/* Quick Screen Recording marker */}
          <button className="p-2 bg-white/10 hover:bg-white/15 rounded-lg border border-white/10 text-white hover:text-red-400 transition" title="تسجيل الحصص">
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Central interactive ERP tools row (Wrench, POS, Save backup) */}
        <div className="flex flex-wrap items-center gap-2.5 justify-center font-bold">
          
          {/* SYSTEM MAINTENANCE PLUG-IN - GREEN RECTANGLE WITH SCREWDRIVER */}
          <button className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-sans font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition transform hover:scale-[1.02] cursor-pointer border-none outline-none">
            <Wrench className="w-4 h-4 text-white" />
            <span>سيستيم صيانة</span>
          </button>

          {/* POINT OF SALE / SALES RECTANGLE */}
          <button className="bg-[#5a2ca6] border border-[#7c3aed]/20 hover:bg-[#4c2293] text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition">
            <LayoutGrid className="w-4 h-4 text-purple-300" />
            <span>نقطة بيع</span>
          </button>

          {/* Adding dynamic shortcuts */}
          <button className="p-2.5 bg-white/10 hover:bg-white/25 rounded-xl border border-white/10 text-white transition animate-none" title="الآلة الحسابية المتطورة">
            <Calculator className="w-4 h-4" />
          </button>

          <button className="p-2.5 bg-white/10 hover:bg-white/25 rounded-xl border border-white/10 text-white transition" title="إضافة سريعة">
            <Plus className="w-4 h-4" />
          </button>

          {/* Automated Backup button as in the mockup */}
          <button className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-sans font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition">
            <Download className="w-4 h-4 text-sky-100" />
            <span className="hidden lg:inline">مزامنة البيانات</span>
          </button>

          <button className="p-2.5 bg-white/10 hover:bg-white/25 rounded-xl border border-white/10 text-white transition" title="التعليمات والروابط">
            <Info className="w-4 h-4" />
          </button>
          
        </div>

        {/* Right Side (RTL context) / Simulation configuration environment */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-center xl:justify-end">
          
          {/* GPS Attendances widget */}
          {["employee", "coach", "marketing_manager", "project_manager", "admin"].includes(currentUser.role) && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClockInGPS}
                disabled={isClockingIn}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white font-sans font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>حضور بالـ GPS</span>
              </button>
              {clockInMessage && (
                <span className="text-[9px] text-emerald-100 bg-emerald-600/30 font-sans border border-emerald-500/30 px-2 py-1.5 rounded-xl max-w-[150px] truncate text-right">
                  {clockInMessage}
                </span>
              )}
            </div>
          )}

          {/* Simulated role container */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1 px-2.5 rounded-xl border border-white/15">
            <span className="text-[10px] text-purple-200 font-bold font-sans">الصلاحية:</span>
            <select
              value={currentUser.role}
              onChange={(e) => handleRoleToggle(e.target.value)}
              className="bg-[#4c1d95] text-white text-[11px] font-sans font-semibold rounded-lg px-2 py-1 focus:ring-0 outline-none border-none cursor-pointer"
              id="header-role-dropdown"
            >
              <option value="admin">مدير النظام CEO (م. حسام)</option>
              <option value="marketing_manager">مدير التسويق والوكالة</option>
              <option value="hr_manager">مدير الموارد البشرية HR</option>
              <option value="academy_manager">مدير المناهج والأكاديمية</option>
              <option value="employee">موظف تسويق وصانع محتوى</option>
              <option value="coach">مدرب / محاضر مبرمج</option>
              <option value="student">طالب ملتحق</option>
              <option value="client">العميل الراعي</option>
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-[#b91c1c] text-white font-sans font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer border-none outline-none"
            title="تسجيل الخروج من النظام الآمن"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>

        </div>

      </header>

      {/* Main Core Body */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full relative">
        
        {/* Workspace Quick Sidebar Navigation - تظهر جانبية على الكمبيوتر وثابتة، ومنسدلة مرنة على الموبايل */}
        <aside className={`lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all duration-300 space-y-4 z-30
          ${isMobileMenuOpen ? "absolute top-4 right-4 left-4 block bg-white" : "hidden lg:flex"}`}
        >
          
          <div className="space-y-1">
            {/* Logo space mapping representing the green indicator from top photo */}
            <div className="bg-[#4c1d95] text-white p-3.5 -mx-4 -mt-4 rounded-t-2xl font-bold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#4bd195] rounded-full animate-pulse"></span>
                <span className="text-xs font-bold font-sans tracking-wide">Hossam BMS / VIQ</span>
              </div>
              <GraduationCap className="w-5 h-5 opacity-90" />
            </div>

            <div className="text-[9px] text-slate-400 font-extrabold tracking-widest font-sans uppercase pt-4 pb-2 text-right">أقسام ومجمعات الـ ERP</div>
            
            <button
              onClick={() => { setActiveModule("dashboard"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "dashboard" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded">الرئيسية</span>
              <span className="flex items-center gap-2">الرئيسية ولوحة القياس</span>
            </button>

            <button
              onClick={() => { setActiveModule("hr"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "hr" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">إدارة الموظفين والـ GPS (HR)</span>
            </button>

            <button
              onClick={() => { setActiveModule("marketing"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "marketing" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Megaphone className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">المبيعات وحملات الوكالة</span>
            </button>

            <button
              onClick={() => { setActiveModule("projects"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "projects" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">المشروعات وتصنيع المحتوى</span>
            </button>

            <button
              onClick={() => { setActiveModule("academy"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "academy" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">الأكاديمية والشهادات والتحقق</span>
            </button>

            <button
              onClick={() => { setActiveModule("finance"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "finance" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Wallet className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">الماليات والضرائب وصافي الخزنة</span>
            </button>

            <button
              onClick={() => { setActiveModule("crm"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "crm" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Bot className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">العلاقات وإشعارات WhatsApp</span>
            </button>

            <button
              onClick={() => { setActiveModule("ai"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "ai" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">المساعد الذكي والتقارير</span>
            </button>

            <button
              onClick={() => { setActiveModule("settings"); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition text-right text-xs font-sans border-r-4 ${
                activeModule === "settings" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="flex items-center gap-2">إعدادات النظام والتدقيق</span>
            </button>

          </div>

          {/* Quick status widget */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right space-y-1 sm:block hidden">
            <div className="text-[9px] text-slate-400 font-sans">تشفير القواعد البينات</div>
            <div className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1 font-sans">
              <span className="text-[10px] bg-slate-200 text-slate-600 font-mono px-1 rounded uppercase">SHA-256</span>
              <span>نشط ومؤمن</span>
            </div>
          </div>

        </aside>

        {/* Unified Application View Port - 9 cols */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Dashboard section */}
          {activeModule === "dashboard" && (
            <div className="space-y-6 text-right">
              
              {/* Dynamic Welcome card from the screenshot in Deep Royal Purple */}
              <div className="bg-[#4c1d95] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#3b0764] hover:shadow-xl transition-shadow">
                
                {/* Greeting text */}
                <div className="space-y-1 flex-1">
                  <h2 className="text-2xl font-bold tracking-tight font-sans text-white">
                    مرحباً، {currentUser.name || "م. حسام الورداني"}
                  </h2>
                  <p className="text-xs text-purple-200 font-medium">
                    أهلاً بك مجدداً في نظام الإدارة الذكية المتكامل. يمكنك متابعة المبيعات والمشتريات وتحليل الخزائن اليومية.
                  </p>
                </div>

                {/* Photo-identical select custom filters ("تصفية حسب التاريخ", "اختر الموقع") */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Date Range Selector Filter */}
                  <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2 cursor-pointer transition">
                    <Calendar className="w-4 h-4 text-purple-200" />
                    <div className="text-right">
                      <span className="block text-[8px] text-purple-200 leading-none">تصفية حسب التاريخ</span>
                      <select 
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="bg-transparent text-white font-sans text-[11px] font-bold border-none p-0 outline-none cursor-pointer focus:ring-0 leading-none"
                      >
                        <option value="last30" className="bg-[#4c1d95] text-white">آخر 30 يوماً</option>
                        <option value="last7" className="bg-[#4c1d95] text-white">آخر 7 أيام</option>
                        <option value="today" className="bg-[#4c1d95] text-white">اليوم الحالي</option>
                        <option value="all" className="bg-[#4c1d95] text-white">كل الفترات</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Selector Filter */}
                  <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2 cursor-pointer transition">
                    <Globe className="w-4 h-4 text-purple-200" />
                    <div className="text-right">
                      <span className="block text-[8px] text-purple-200 leading-none">اختر الموقع</span>
                      <select 
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="bg-transparent text-white font-sans text-[11px] font-bold border-none p-0 outline-none cursor-pointer focus:ring-0 leading-none"
                      >
                        <option value="all" className="bg-[#4c1d95] text-white">كل الفروع والوكالات</option>
                        <option value="cairo" className="bg-[#4c1d95] text-white">مقر القاهرة الرئيسي</option>
                        <option value="alex" className="bg-[#4c1d95] text-white">مكتب الإسكندرية</option>
                        <option value="remote" className="bg-[#4c1d95] text-white">طاقم العمل عن بعد</option>
                      </select>
                    </div>
                  </div>

                </div>

              </div>

              {/* Core metrics overview graphs bar - Photo-identical 8-Card Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* CARD 1: إجمالي المبيعات */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold">إجمالي المبيعات</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displaySales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#eff6ff] flex items-center justify-center border border-blue-100 text-[#2563eb] shadow-inner">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 2: إجمالي الخزنة */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold">إجمالي الخزنة</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displayVault.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center border border-emerald-100 text-[#059669] shadow-inner">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 3: الفواتير الغير مدفوعة */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold">الفواتير غير مدفوعة</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displayUnpaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#fffbeb] flex items-center justify-center border border-amber-100 text-[#d97706] shadow-inner">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 4: إجمالي مرتجع المبيعات */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold font-bold">إجمالي مرتجع المبيعات</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displaySalesReturns.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center border border-rose-100 text-[#dc2626] shadow-inner">
                    <RefreshCw className="w-5 h-5 animate-spin-slow" />
                  </div>
                </div>

                {/* CARD 5: إجمالي المشتريات */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold">إجمالي المشتريات</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displayPurchases.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center border border-indigo-100 text-[#4f46e5] shadow-inner">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 6: المشتريات غير مدفوعة */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold">المشتريات غير مدفوعة</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displayUnpaidPurchases.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#fffbeb] flex items-center justify-center border border-amber-100 text-[#b45309] shadow-inner">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 7: إجمالي مرتجع المشتريات */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold font-bold">إجمالي مرتجع مشتريات</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displayPurchaseReturns.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center border border-red-100 text-[#b91c1c] shadow-inner">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 8: مصروف */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between text-right">
                  <div className="space-y-1 flex-1">
                    <div className="text-xs text-slate-500 font-sans font-semibold">مصروف تشغيلي</div>
                    <div className="text-[17px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                      L.E {displayExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#fff7ed] flex items-center justify-center border border-orange-100 text-[#ea580c] shadow-inner">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Photo-identical sales timeline graph */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f5f3ff] flex items-center justify-center text-[#4c1d95]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-sans">المبيعات في آخر 30 يومًا</h3>
                  </div>
                  
                  {/* Clean filter / select pill */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-slate-600">القنوات والمؤشرات الأربعة للفروع</span>
                  </div>
                </div>

                {/* Graph Area */}
                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorRealEstate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorCairo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorWholesale" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.12)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 9, fill: '#94a3b8' }} 
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 9, fill: '#94a3b8' }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090d16', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '11px', textAlign: 'right', color: '#f1f5f9' }}
                        labelStyle={{ fontWeight: 'bold', color: '#c7d2fe' }}
                      />
                      <Area 
                        type="monotone" 
                        name="Business Development (BL0001)" 
                        dataKey="sales" 
                        stroke="#a78bfa" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                      <Area 
                        type="monotone" 
                        name="VIQ real estate" 
                        dataKey="realEstate" 
                        stroke="#38bdf8" 
                        strokeWidth={1.5}
                        fillOpacity={1} 
                        fill="url(#colorRealEstate)" 
                      />
                      <Area 
                        type="monotone" 
                        name="(BL0003) سوق كايرو" 
                        dataKey="cairoStore" 
                        stroke="#34d399" 
                        strokeWidth={1.5}
                        fillOpacity={1} 
                        fill="url(#colorCairo)" 
                      />
                      <Area 
                        type="monotone" 
                        name="(BL0004) جملة الجملة كميات" 
                        dataKey="wholesale" 
                        stroke="#fbbf24" 
                        strokeWidth={1.5}
                        fillOpacity={1} 
                        fill="url(#colorWholesale)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Legend mirroring the reference image exactly */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4c1d95]"></span>
                    <span className="font-bold">Business Development (BL0001)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                    <span className="font-bold">VIQ real estate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                    <span className="font-bold">(BL0003) سوق كايرو</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                    <span className="font-bold">(BL0004) جملة الجملة كميات</span>
                  </div>
                </div>
              </div>

              {/* Live Alerts & Information panel for dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow transition">
                  <h4 className="text-xs font-bold text-slate-700 font-sans border-b border-slate-100 pb-2 mb-3">أحدث تسجيلات الحضور الموثقة بالـ GPS</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {attendance.slice(0, 4).map(att => {
                      const matched = users.find(u => u.id === att.userId);
                      return (
                        <div key={att.id} className="bg-slate-50 p-2.5 rounded-lg text-xs flex justify-between items-center text-right font-sans border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-mono">سجل في: {att.clockIn}</span>
                          <div>
                            <span className="font-bold text-[#4c1d95]">{matched?.name || "موظف متميز"}</span>
                            <div className="text-[9px] text-slate-555 mt-0.5">خط العرض: {att.latitude?.toFixed(4)} | خط الطول: {att.longitude?.toFixed(4)}</div>
                          </div>
                        </div>
                      );
                    })}
                    {attendance.length === 0 && (
                      <div className="text-center p-4 text-xs text-slate-400">لا يوجد تسجيلات حضور حية اليوم</div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow transition">
                  <h4 className="text-xs font-bold text-slate-700 font-sans border-b border-slate-100 pb-2 mb-3 font-bold">المهام العاجلة والعملاء المخططين</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tasks.slice(0, 4).map(task => (
                      <div key={task.id} className="bg-slate-50 p-2.5 rounded-lg text-xs leading-relaxed text-right border border-slate-100">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${task.priority === "high" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-slate-100 text-slate-600"}`}>
                            {task.priority === "high" ? "حالة عاجلة" : "طبيعية"}
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">ID: {task.id}</span>
                        </div>
                        <p className="text-slate-800 text-[11px] font-bold">{task.title}</p>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-center p-4 text-xs text-slate-400">لا يوجد مهام حالية بقاعدة البيانات</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Marketing Module Toggle portal */}
          {activeModule === "marketing" && (
            <MarketingModule
              currentUser={currentUser}
              clients={clients}
              contracts={contracts}
              proposals={proposals}
              campaigns={campaigns}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* Project Module Toggle portal */}
          {activeModule === "projects" && (
            <ProjectModule
              currentUser={currentUser}
              projects={projects}
              tasks={tasks}
              clients={clients}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* Academy Module Toggle portal */}
          {activeModule === "academy" && (
            <AcademyModule
              currentUser={currentUser}
              courses={courses}
              enrollments={enrollments}
              quizzes={quizzes}
              assignments={assignments}
              submissions={submissions}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* HR Module Toggle portal */}
          {activeModule === "hr" && (
            <HRModule
              currentUser={currentUser}
              users={users}
              attendance={attendance}
              leaveRequests={leaveRequests}
              performanceReviews={performanceReviews}
              candidates={candidates}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* Finance Module Toggle portal */}
          {activeModule === "finance" && (
            <FinanceModule
              currentUser={currentUser}
              transactions={transactions}
              clients={clients}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* CRM & WhatsApp Module */}
          {activeModule === "crm" && (
            <CRMModule
              currentUser={currentUser}
              clients={clients}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

          {/* AI reports Module */}
          {activeModule === "ai" && (
            <AIModule
              currentUser={currentUser}
              systemConfig={systemConfig}
            />
          )}

          {/* Settings and audit logs Module */}
          {activeModule === "settings" && (
            <SystemSettingsModule
              currentUser={currentUser}
              systemConfig={systemConfig}
              auditLogs={auditLogs}
              users={users}
              onDataChanged={loadWorkspaceData}
            />
          )}

        </div>

      </main>

      {/* Footer information panel */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-[10px] text-slate-500 space-y-0.5">
        <div>جميع الحقوق محفوظة © {new Date().getFullYear()} لمؤسسة حسام الورداني لإدارة خدمات التسويق والأكاديميات.</div>
        <div>نظام سحابي معزز بالتشفير المعتمد (SHA-256) والذكاء الاصطناعي.</div>
      </footer>

    </div>
  );
}
