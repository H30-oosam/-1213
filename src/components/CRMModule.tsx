import React, { useState } from "react";
import { User, ClientCorp } from "../types";
import { sendWhatsAppNotification } from "../utils";
import { MessageSquare, ThumbsUp, CheckCircle, Star, Send, PhoneCall, Smartphone, BellRing, Target } from "lucide-react";

interface CRMModuleProps {
  currentUser: User;
  clients: ClientCorp[];
  users: User[];
  onDataChanged: () => void;
}

export default function CRMModule({
  currentUser,
  clients,
  users,
  onDataChanged
}: CRMModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"leads" | "alerts" | "surveys">("leads");

  // Lead tracker states with mock ratings
  const [leadScores, setLeadScores] = useState<Record<string, number>>({
    "c-1": 90,
    "c-2": 75,
    "c-3": 60
  });

  // Dynamic alert composer states
  const [alertTarget, setAlertTarget] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [simulationLog, setSimulationLog] = useState<Array<{ text: string; time: string }>>([]);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const handleUpdateScore = (clientId: string, delta: number) => {
    setLeadScores(prev => {
      const current = prev[clientId] || 50;
      const computed = Math.max(0, Math.min(100, current + delta));
      return { ...prev, [clientId]: computed };
    });
  };

  const handleFireWhatsAppAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTarget || !alertMessage.trim()) return;

    setIsSendingAlert(true);
    const success = await sendWhatsAppNotification(alertTarget, alertMessage, currentUser.id, currentUser.name);
    
    if (success) {
      setSimulationLog(prev => [
        {
          text: `[WhatsApp SIMULATION] تم إرسال رسالة إلى الهوية ${alertTarget}: "${alertMessage}"`,
          time: new Date().toLocaleTimeString("ar-EG")
        },
        ...prev
      ]);
      setAlertMessage("");
    }
    setIsSendingAlert(false);
  };

  const allContacts = [
    ...users.map(u => ({ id: u.id, name: u.name, phone: u.phone, subText: u.role })),
    ...clients.map(c => ({ id: c.id, name: `${c.name} (${c.company})`, phone: c.phone, subText: "عميل تسويق" }))
  ];

  return (
    <div className="space-y-6" id="crm-module-main">
      
      {/* Upper Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1.5 scroll-x-auto">
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeSubTab === "leads" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>تأهيل العملاء المحتملين Lead Scoring</span>
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeSubTab === "alerts" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>مرسـل تنبيهات WhatsApp وتلقين الإشعارات</span>
        </button>
        <button
          onClick={() => setActiveTab("surveys")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeSubTab === "surveys" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>مؤشر رضا المشتركين والعملاء CSAT</span>
        </button>
      </div>

      {/* Leads management tab */}
      {activeSubTab === "leads" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => {
            const currentScore = leadScores[c.id] || 50;
            return (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] bg-slate-950 font-mono text-indigo-400 px-2.5 py-0.5 rounded border border-slate-800">
                      قناة الوكالة الخارجية
                    </span>
                    <span className={`text-[10px] font-bold ${currentScore >= 75 ? "text-emerald-400" : currentScore >= 50 ? "text-amber-400" : "text-slate-400"}`}>
                      درجة الاهتمام: {currentScore}%
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 font-sans mb-1 text-right">{c.name}</h3>
                  <div className="text-xs text-indigo-400 font-medium mb-3 text-right">{c.company}</div>

                  {/* Meter line */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        currentScore >= 75 ? "bg-emerald-500" : currentScore >= 50 ? "bg-amber-500" : "bg-slate-600"
                      }`} 
                      style={{ width: `${currentScore}%` }} 
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                  <div className="text-[10px] text-slate-500 text-right font-mono">
                    تعديل الاهتمام
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateScore(c.id, -10)}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-850 text-rose-400 text-xs border border-slate-800 rounded"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleUpdateScore(c.id, 10)}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-850 text-emerald-400 text-xs border border-slate-800 rounded"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alerts & Communication panel */}
      {activeSubTab === "alerts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <form onSubmit={handleFireWhatsAppAlert} className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-100 font-sans border-b border-slate-800 pb-2 flex items-center gap-1.5 justify-end">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>لوحة إطلاق رسائل الواتساب الفورية</span>
            </h3>

            <div className="space-y-3 text-xs text-right">
              <div>
                <label className="block text-slate-400 mb-1">اختر الموظف / المعيل / الطالب المستهدف</label>
                <select 
                  required 
                  value={alertTarget} 
                  onChange={e => setAlertTarget(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-indigo-500 text-right"
                >
                  <option value="">-- اختر من السجلات الموحدة --</option>
                  {allContacts.map(con => (
                    <option key={con.id} value={con.phone}>{con.name} ({con.subText}) [{con.phone}]</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">صيغة إشعار الواتساب Draft Message</label>
                <textarea 
                  required 
                  rows={4} 
                  value={alertMessage} 
                  onChange={e => setAlertMessage(e.target.value)} 
                  placeholder="مرحباً، تم تفعيل دورة التدريب الاحترافية في أكاديميتنا اليوم بنجاح ونتمنى لكم التوفيق..."
                  className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded text-right focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingAlert || !alertTarget}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 transform rotate-180" />
                <span>إطلاق الإرسال الفوري لـ WhatsApp</span>
              </button>
            </div>
          </form>

          {/* Simulated phone output logging */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100 border-b border-slate-800 pb-2 mb-3 text-right">مراقبة محاكاة خط الاتصال اللاسلكي والرسائل المرتدة</h3>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed text-right mb-4">
                تظهر هنا سجلات حزم التنبيهات الصادرة فورياً عبر خوادم WhatsApp Gateway للمشتركين للتأكيد الذاتي على الفواتير، الغيابات، والكورسات.
              </p>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-850 rounded p-3 overflow-y-auto max-h-[220px] font-mono text-[11px] text-slate-400 text-right space-y-2 leading-relaxed">
              {simulationLog.length > 0 ? (
                simulationLog.map((log, li) => (
                  <div key={li} className="border-b border-slate-900 pb-1 text-slate-300">
                    <span className="text-emerald-500 font-bold">[{log.time}]</span> {log.text}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 py-12 text-center text-xs">
                  لا توجد مراسلات معلقة؛ قم بإرسال رسالة تجريبية لمعاينة فك التشفير التلقائي.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* CSAT and reviews surveys */}
      {activeSubTab === "surveys" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-100 border-b border-slate-850 pb-2 mb-1">شركاء الشركة ومعدل الرضا العام</h3>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-sans text-emerald-400">92%</span>
              <span className="text-slate-400 text-xs">معدل الفائدة المقدرة لعملاء التسويق.</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed text-right">
              تم استرجاع تقييم إجمالي شامل من استبيان الربع الثاني لربط الأكاديمية والشركات؛ نسبة الرضى بلغت 92% مع تطلعات لرفع جودة المحتوى المصور.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-100 border-b border-slate-850 pb-2 mb-1">لوحة التقييم والنجوم للكورسات</h3>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-base font-sans">
              <Star className="w-4 h-4 fill-amber-500" />
              <span>4.9 / 5.0</span>
              <span className="text-slate-500 text-[11px] font-normal mr-2">بناءً على 142 كراسة تقييم</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed text-right">
              تعمل التقييمات التلقائية المربوطة فور تخرج الطالب واستلامه شهادة التحقق على تحسين الكفاءة التدريبية ومستوى فنيي التدريس بالأكاديمية.
            </p>
          </div>
        </div>
      )}

    </div>
  );

  function setActiveTab(v: "leads" | "alerts" | "surveys") {
    setActiveSubTab(v);
  }
}
