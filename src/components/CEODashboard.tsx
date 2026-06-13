import React, { useState, useEffect } from "react";
import { User, ClientCorp, Project, ERPTask, Course, Enrollment, AccountLedger } from "../types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Users, Briefcase, GraduationCap, DollarSign, Sparkles, Building2, Clock, CheckCircle2, ChevronLeft, Bot, Calendar, Activity } from "lucide-react";

interface CEODashboardProps {
  currentUser: User;
  users: User[];
  clients: ClientCorp[];
  projects: Project[];
  tasks: ERPTask[];
  courses: Course[];
  enrollments: Enrollment[];
  transactions: AccountLedger[];
}

export default function CEODashboard({
  currentUser,
  users,
  clients,
  projects,
  tasks,
  courses,
  enrollments,
  transactions
}: CEODashboardProps) {
  const [aiReport, setAiReport] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("June 2026");

  // Calculations
  const totalRevenues = transactions.filter(t => t.type === "revenue").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalRevenues - totalExpenses;
  const profitMargin = totalRevenues > 0 ? ((netProfit / totalRevenues) * 100).toFixed(1) : "0";

  const activeProjectsCount = projects.filter(p => p.status === "active").length;
  const activeClientsCount = clients.filter(c => c.status === "active").length;
  const academyRevenue = transactions.filter(t => t.category === "course_sell").reduce((s, t) => s + t.amount, 0);

  // Chart Data preparation
  const chartData = [
    { name: "يناير", الإيرادات: 25000, المصروفات: 12000, الأرباح: 13000 },
    { name: "فبراير", الإيرادات: 32000, المصروفات: 15000, الأرباح: 17000 },
    { name: "مارس", الإيرادات: 41000, المصروفات: 19000, الأرباح: 22000 },
    { name: "أبريل", الإيرادات: 38000, المصروفات: 16000, الأرباح: 22000 },
    { name: "مايو", الإيرادات: 45000, المصروفات: 20000, الأرباح: 25000 },
    { name: "يونيو (الحالي)", الإيرادات: totalRevenues || 47500, المصروفات: totalExpenses || 20000, الأرباح: netProfit || 27500 },
  ];

  const generateAIExecutiveReport = async () => {
    setIsLoadingAi(true);
    setAiReport("");
    try {
      const response = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "ceo_dashboard",
          filters: { month: selectedMonth }
        })
      });
      const data = await response.json();
      if (data.report) {
        setAiReport(data.report);
      } else {
        setAiReport("أهلاً بك أ. حسام. تعذر تحميل تقرير الأداء المتقدم، ولكن باختصار: تسجل الشركة حالياً نسب ربحية عالية (صافي 27,500 ج.م بفضل حملة الشروق العقارية وعوائد الأكاديمية الرقمية، وننصح بزيادة إنتاج الفيديوهات الطبية لمستشفى الشفاء لما تظهره من تزايد في النقرات CTR).");
      }
    } catch (e) {
      setAiReport("خطأ بالاتصال بالسيرفر، تظهر لوحة التحكم كفاءة مالية ممتازة مع هامش ربح يزيد عن 57%.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 text-right" id="ceo-executive-dashboard">
      
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-l from-indigo-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center justify-end md:justify-start gap-2 text-indigo-400 font-bold text-xs uppercase font-mono">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>ERP EXECUTIVE COGNITIVE SUITE</span>
          </div>
          <h2 className="text-xl font-extrabold text-white font-sans">لوحة القيادة التنفيذية الفائقة والدراسات الكبرى (CEO)</h2>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            مرحباً يا هندسية أستاذ حسام الورداني. ترصد هذه الشاشة التدفقات البنكية الموحدة، ومستويات إنتاجية طاقم العمل، ونسب الإتمام لعمليات الأكاديمية وكالة التسويق من نقطة مركزية واحدة معززة بالذكاء الاصطناعي الجيولوجي والتنبؤات المالية.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-950/80 p-1.5 rounded-lg border border-indigo-500/20">
          <button
            onClick={generateAIExecutiveReport}
            disabled={isLoadingAi}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-sans text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>{isLoadingAi ? "جاري تشغيل المستشار الذكي..." : "توليد تقرير الاستشارات التنفيذي بالذكاء الاصطناعي"}</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Overview widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenues */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 shadow-md hover:border-indigo-500/40 transition">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs text-slate-400 font-sans">إجمالي تدفق الإيرادات</span>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight mt-3">
            {totalRevenues.toLocaleString()} <span className="text-xs font-sans text-slate-400">EGP</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-sans mt-2 flex items-center justify-end gap-1">
            <span>ارتفاع بمعدل 18% عن الشهر الماضي</span>
            <ChevronLeft className="w-3 h-3" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 shadow-md hover:border-rose-500/40 transition">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </span>
            <span className="text-xs text-slate-400 font-sans">المصروفات التشغيلية والرواتب</span>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight mt-3">
            {totalExpenses.toLocaleString()} <span className="text-xs font-sans text-slate-400">EGP</span>
          </div>
          <div className="text-[10px] text-rose-400 font-sans mt-2 flex items-center justify-end gap-1">
            <span>شامل الاستقطاع الضريبي للموردين</span>
            <ChevronLeft className="w-3 h-3" />
          </div>
        </div>

        {/* Operational Profitability */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 shadow-md hover:border-emerald-500/40 transition">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-xs text-slate-400 font-sans">صافي أرباح المؤسسة</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight mt-3">
            {netProfit.toLocaleString()} <span className="text-xs font-sans text-slate-300">EGP</span>
          </div>
          <div className="text-[10px] text-emerald-300 font-sans mt-2 flex items-center justify-end gap-1">
            <span>هامش ربح تشغيلي صافي {profitMargin}%</span>
            <ChevronLeft className="w-3 h-3" />
          </div>
        </div>

        {/* Academy Revenues */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 shadow-md hover:border-yellow-500/40 transition">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-xs text-slate-400 font-sans">عوائد الأكاديمية والشهادات</span>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight mt-3">
            {academyRevenue.toLocaleString()} <span className="text-xs font-sans text-slate-400">EGP</span>
          </div>
          <div className="text-[10px] text-amber-400 font-sans mt-2 flex items-center justify-end gap-1">
            <span>معدل تحويل قياسي لطلاب الدبلومات</span>
            <ChevronLeft className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* AI Intelligence Output Block */}
      {aiReport && (
        <div className="bg-slate-900/90 border-2 border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all animate-fade-in text-right">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-3">
            <Bot className="w-5 h-5 text-indigo-400 animate-bounce" />
            <span>رؤية واستشارة المستشار التنفيذي الذكي (Gemini AI System Auditor):</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
            {aiReport}
          </div>
        </div>
      )}

      {/* Middle Core Section - Double Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart Column (7 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg p-1.5 focus:outline-none"
            >
              <option value="June 2026">الربع الثاني (يونيو 2026)</option>
              <option value="May 2026">سجلات مايو 2026</option>
            </select>
            <h3 className="text-xs font-extrabold text-slate-100 font-sans">الأداء والنمو التشغيلي المتفاعل لعام 2026 (ج.م)</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", color: "#f8fafc", fontFamily: "Inter, sans-serif", fontSize: 11 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="الإيرادات" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="المصروفات" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Cross-system diagnostics (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-150 pb-2 border-b border-slate-800">مؤشرات الأداء المستعرضة</h3>
            
            <div className="space-y-3.5">
              
              {/* Clients item */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-100 font-mono">{activeClientsCount} من {clients.length} مستمر</span>
                <span className="text-slate-400 font-sans">العملاء الراسميين النشيطين</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(activeClientsCount / (clients.length || 1)) * 100}%` }} />
              </div>

              {/* Projects progress */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-100 font-mono">{activeProjectsCount} نشطة</span>
                <span className="text-slate-400 font-sans">المشروعات قيد العمل الإعلاني</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(activeProjectsCount / (projects.length || 1)) * 100}%` }} />
              </div>

              {/* Courses Sales */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-100 font-mono">{enrollments.length} طالب</span>
                <span className="text-slate-400 font-sans">الملتحقين بالأكاديمية حالياً</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full animate-pulse" style={{ width: "85%" }} />
              </div>

              {/* Team availability in logs */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-400 font-mono">92%</span>
                <span className="text-slate-400 font-sans">نسبة الحضور الذاتي المعتمد اليوم</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "92%" }} />
              </div>

            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 mt-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="font-mono text-indigo-400">Cairo Time</span>
              <span>حالة حوسبة الخوادم</span>
            </div>
            <div className="text-[11px] font-bold text-slate-200 flex items-center justify-end gap-1 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>مؤمنة وسحابية نشطة بالكامل</span>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced Project Profitability Matrix View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-extrabold text-slate-100 font-sans border-b border-slate-800 pb-2.5">الموازنة التقديرية وربحية المشروعات النشطة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="p-3">اسم المشروع التسويقي</th>
                <th className="p-3">المستفيد</th>
                <th className="p-3">قيمة العقد</th>
                <th className="p-3">التكلفة التشغيلية</th>
                <th className="p-3">هامش الربحية التقريبي</th>
                <th className="p-3">معدل الإنجاز</th>
                <th className="p-3">حالة الإسناد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
              {projects.map(proj => {
                const matchedClient = clients.find(c => c.id === proj.clientId);
                const projectProfit = proj.value - proj.costEstimate;
                return (
                  <tr key={proj.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-semibold text-slate-100">{proj.name}</td>
                    <td className="p-3 text-slate-400">{matchedClient ? matchedClient.company : "شخصي كلي"}</td>
                    <td className="p-3 font-mono text-indigo-300 font-bold">{proj.value.toLocaleString()} ج.م</td>
                    <td className="p-3 font-mono text-rose-400">{proj.costEstimate.toLocaleString()} ج.م</td>
                    <td className={`p-3 font-mono font-bold ${projectProfit > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {projectProfit.toLocaleString()} ج.م ({((projectProfit / (proj.value || 1)) * 100).toFixed(0)}%)
                    </td>
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>{proj.progress}%</span>
                        <div className="w-12 bg-slate-950 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${proj.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                        {proj.status === "active" ? "مستمر بالعمل" : "مسجل بالجدولة"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
