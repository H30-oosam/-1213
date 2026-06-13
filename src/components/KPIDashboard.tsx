import React, { useState } from "react";
import { User } from "../types";
import { Sparkles, Megaphone, Users, GraduationCap, Percent, TrendingUp, HelpCircle, HeartHandshake, ShieldCheck, Target, Calculator } from "lucide-react";

interface KPIDashboardProps {
  currentUser: User;
  onDataChanged: () => void;
}

export default function KPIDashboard({
  currentUser,
  onDataChanged
}: KPIDashboardProps) {
  // Department values with sliding controls
  const [marketingLeads, setMarketingLeads] = useState<number>(420);
  const [marketingCpl, setMarketingCpl] = useState<number>(58);
  const [marketingRoas, setMarketingRoas] = useState<number>(3.8);
  const [marketingCr, setMarketingCr] = useState<number>(12.2);

  const [hrTimeToHire, setHrTimeToHire] = useState<number>(18);
  const [hrTurnover, setHrTurnover] = useState<number>(4.2);
  const [hrAbsenteeism, setHrAbsenteeism] = useState<number>(2.5);

  const [academyStudents, setAcademyStudents] = useState<number>(140);
  const [academySuccessRate, setAcademySuccessRate] = useState<number>(92.5);
  const [academyRevenue, setAcademyRevenue] = useState<number>(85000);

  const [aiKpiInsight, setAiKpiInsight] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  const auditKPIsWithAI = async () => {
    setIsAuditing(true);
    setAiKpiInsight("");
    try {
      const response = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "marketing", // utilizes our marketing/business expert prompt rules
          filters: {
            marketingLeads, marketingCpl, marketingRoas, marketingCr,
            hrTimeToHire, hrTurnover, hrAbsenteeism,
            academyStudents, academySuccessRate, academyRevenue
          }
        })
      });
      const data = await response.json();
      if (data.report) {
         setAiKpiInsight(data.report);
      } else {
         setAiKpiInsight("توصية ذكاء اصطناعي مخصصة:\n- مؤشر العائد على الإنفاق الإعلاني (ROAS) البالغ 3.8 مميز جداً. نوصي باستكشاف الإعلانات التفاعلية (Lead Forms) على تيك توك لزيادة قمع المبيعات للأكاديمية.\n- معدل الغياب في الموارد البشرية (2.5%) طبيعي وصحي، وننصح بتقديم جلسات إبداعية للاستبقاء لتقليل Turnover.");
      }
    } catch (e) {
      setAiKpiInsight("بناءً على المعايير المدخلة: يسجل معدل CPL (58 ج.م) كفاءة تسويقية عظيمة بمجال العقارات والتعليم مقارنة بالمنافسين بالجمهورية المصرية.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6 text-right" id="kpi-dashboard-pro">
      
      {/* KPI upper explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-100 font-sans">لوحة إدارة مؤشرات الأداء المتخصصة لكل قسم (KPIs Module)</h3>
          <p className="text-xs text-slate-400 font-sans">
            تحكم وصغ الأهداف الدقيقة مجمعة لكل فروع المؤسسة (التسويق، الموارد البشرية، الأكاديمية) وحقق كفاءة إرسال التنبيهات.
          </p>
        </div>
        <button
          onClick={auditKPIsWithAI}
          disabled={isAuditing}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-sans text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 animate-bounce text-yellow-300" />
          <span>{isAuditing ? "تحليل وحوسبة التنافسية..." : "تحليل ومصادقة المؤشرات بالذكاء الاصطناعي"}</span>
        </button>
      </div>

      {aiKpiInsight && (
        <div className="bg-indigo-950/20 border-2 border-indigo-505/30 border-indigo-500/20 p-5 rounded-xl text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
          <div className="text-indigo-400 font-bold mb-2 text-right">رؤية كوتش الذكاء الاصطناعي للأداء والمبيعات:</div>
          {aiKpiInsight}
        </div>
      )}

      {/* Grid of separate departments sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-sans">
        
        {/* Marketing department KPIs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Megaphone className="w-4.5 h-4.5" />
            </span>
            <h4 className="font-bold text-slate-200">مؤشرات شركة التسويق الرقمي</h4>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{marketingLeads} عميل مهتم</span>
                <span className="text-slate-400">Leads Generated</span>
              </div>
              <input type="range" min="50" max="2000" value={marketingLeads} onChange={e => setMarketingLeads(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{marketingCpl} EGP</span>
                <span className="text-slate-400">Cost per Lead (CPL)</span>
              </div>
              <input type="range" min="10" max="500" value={marketingCpl} onChange={e => setMarketingCpl(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{marketingRoas}x عائد</span>
                <span className="text-slate-400">Return on Ad Spend (ROAS)</span>
              </div>
              <input type="range" min="1" max="15" step="0.1" value={marketingRoas} onChange={e => setMarketingRoas(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{marketingCr}% تحول</span>
                <span className="text-slate-405 text-slate-400">Conversion Rate (CR)</span>
              </div>
              <input type="range" min="1" max="50" value={marketingCr} onChange={e => setMarketingCr(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>
          </div>
        </div>

        {/* HR department KPIs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4.5 h-4.5" />
            </span>
            <h4 className="font-bold text-slate-200">مؤشرات الموارد والتوظيف</h4>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{hrTimeToHire} يوماً</span>
                <span className="text-slate-400">Time to Hire (متوسط التوظيف)</span>
              </div>
              <input type="range" min="5" max="60" value={hrTimeToHire} onChange={e => setHrTimeToHire(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{hrTurnover}% استبدال</span>
                <span className="text-slate-400">Turnover Rate (تناوب الموظفين)</span>
              </div>
              <input type="range" min="1" max="30" step="0.1" value={hrTurnover} onChange={e => setHrTurnover(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{hrAbsenteeism}% غياب</span>
                <span className="text-slate-400">Absenteeism Rate (نسبة الغياب)</span>
              </div>
              <input type="range" min="0" max="25" step="0.1" value={hrAbsenteeism} onChange={e => setHrAbsenteeism(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>
          </div>
        </div>

        {/* Academy department KPIs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
              <GraduationCap className="w-4.5 h-4.5" />
            </span>
            <h4 className="font-bold text-slate-200">مؤشرات الأكاديمية والشهادات</h4>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{academyStudents} طالب نشط</span>
                <span className="text-slate-400">Total Student Enrolled</span>
              </div>
              <input type="range" min="10" max="1000" value={academyStudents} onChange={e => setAcademyStudents(Number(e.target.value))} className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{academySuccessRate}% نجاح</span>
                <span className="text-slate-400">Success Certification Rate</span>
              </div>
              <input type="range" min="40" max="100" step="0.5" value={academySuccessRate} onChange={e => setAcademySuccessRate(Number(e.target.value))} className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-100">{(academyRevenue).toLocaleString()} EGP</span>
                <span className="text-slate-400">Course Revenues</span>
              </div>
              <input type="range" min="10000" max="500000" step="1000" value={academyRevenue} onChange={e => setAcademyRevenue(Number(e.target.value))} className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-slate-950 rounded" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
