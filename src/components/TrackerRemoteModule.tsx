import React, { useState, useEffect } from "react";
import { User, ERPTask } from "../types";
import { syncERPCollection } from "../utils";
import { Clock, Play, Square, Timer, Monitor, Camera, MapPin, Map, ShieldCheck, Database, BarChart3, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

interface TimeLog {
  id: string;
  userId: string;
  taskTitle: string;
  startTime: string;
  endTime: string;
  hours: number;
  costPerHour: number;
  screenshotLogs: string[];
}

interface TrackerRemoteModuleProps {
  currentUser: User;
  users: User[];
  tasks: ERPTask[];
  onDataChanged: () => void;
}

export default function TrackerRemoteModule({
  currentUser,
  users,
  tasks,
  onDataChanged
}: TrackerRemoteModuleProps) {
  const [activeTab, setActiveTab] = useState<"tracking" | "remote_dashboard">("tracking");

  // Timer run trigger states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [trackedTask, setTrackedTask] = useState<string>("");
  const [hourlyCost, setHourlyCost] = useState<number>(150);
  const [seconds, setSeconds] = useState<number>(0);
  const [timerId, setTimerId] = useState<any>(null);

  // Time logging list
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([
    { id: "log-1", userId: "u-8", taskTitle: "تصميم كاروسيل الشروق العقاري وتطوير الخطوط", startTime: "2026-06-13T09:00:00Z", endTime: "2026-06-13T12:30:00Z", hours: 3.5, costPerHour: 150, screenshotLogs: ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150", "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=150"] },
    { id: "log-2", userId: "u-2", taskTitle: "كتابة سكريبت الفيديوهات الطبية لمستشفى الشفاء", startTime: "2026-06-12T10:00:00Z", endTime: "2026-06-12T12:00:00Z", hours: 2.0, costPerHour: 200, screenshotLogs: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150"] },
  ]);

  // Handle active countdown timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartTimer = () => {
    if (!trackedTask) return;
    setIsRunning(true);
    setSeconds(0);
  };

  const handleStopTimer = async () => {
    setIsRunning(false);
    const hoursLogged = Number((seconds / 3600).toFixed(4)) || 0.05; // default minimum
    
    const newLog: TimeLog = {
      id: `timer-${Date.now()}`,
      userId: currentUser.id,
      taskTitle: trackedTask,
      startTime: new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      hours: Number(hoursLogged.toFixed(2)) || 0.1,
      costPerHour: hourlyCost,
      screenshotLogs: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150",
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150"
      ]
    };

    const updated = [newLog, ...timeLogs];
    setTimeLogs(updated);
    setTrackedTask("");
    setSeconds(0);

    // Save logs audit database update
    await syncERPCollection("timeLogs", updated, currentUser.id, currentUser.name, `تسجيل عدد {${newLog.hours}} ساعة في إنجاز مهمة: "${newLog.taskTitle}" بقيمة تكلفة إجمالية {${(newLog.hours * newLog.costPerHour).toFixed(1)}} ج.م.`);
    onDataChanged();
  };

  // Convert seconds to readable stopwatch text
  const formatStopwatchText = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-right" id="tracking-remote-system">
      
      {/* Tab select links */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("tracking")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "tracking" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>مراقب تتبع الوقت والمهام الحية (Stopwatch)</span>
        </button>
        <button
          onClick={() => setActiveTab("remote_dashboard")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "remote_dashboard" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>إدارة ومراقبة العمل عن بعد (Remote Work Control)</span>
        </button>
      </div>

      {activeTab === "tracking" && (
        <div className="space-y-6">
          
          {/* Main stopwatch interface */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Stopwatch dial (5 cols) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center space-y-3 bg-slate-950 p-6 rounded-2xl border border-slate-850">
              <span className="text-[10px] bg-indigo-900/40 text-indigo-300 px-3 py-1 rounded-full font-mono uppercase font-bold tracking-wider">Time Logger Active</span>
              <div className="text-3xl font-mono font-black text-rose-400 tracking-wider">
                {formatStopwatchText(seconds)}
              </div>
              
              <div className="flex gap-2 w-full pt-1.5">
                {!isRunning ? (
                  <button
                    onClick={handleStartTimer}
                    disabled={!trackedTask}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-sans text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-4 h-4" />
                    <span>ابدأ عد الساعات</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopTimer}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Square className="w-4 h-4" />
                    <span>إيقاف وحفظ الإنجاز</span>
                  </button>
                )}
              </div>
            </div>

            {/* Config & Task select (8 cols) */}
            <div className="md:col-span-8 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1.5">اختر المهمة المعنية بالتسجيل</label>
                <select
                  value={trackedTask}
                  onChange={e => setTrackedTask(e.target.value)}
                  disabled={isRunning}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 p-2.5 rounded-lg focus:outline-none"
                >
                  <option value="">-- اضغط لتحديد المهمة --</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.title}>{t.title} ({t.status === "in_progress" ? "جارية" : "مستلمة"})</option>
                  ))}
                  <option value="اجتماع داخلي أو تقرير دوري للعميل">اجتماع تنسيقي مع العميل / م. حسام الورداني</option>
                  <option value="صناعة وتعديل محتوى بالذكاء الاصطناعي">كتابة وتحرير إعلانات ممولة بالذكاء الاصطناعي</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">تكلفة ساعة الموظف الفنية (EGP)</label>
                  <input
                    type="number"
                    value={hourlyCost}
                    onChange={e => setHourlyCost(Number(e.target.value))}
                    disabled={isRunning}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">إنتاجية الموظف الذاتية المقدرة</label>
                  <div className="bg-slate-950 border border-slate-850 p-2 rounded font-mono font-bold text-emerald-400 text-center">
                    {isRunning ? "احتساب حي نشط..." : "94% مستمرة"}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Time logs history list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4.5">
            <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1 justify-end">
              <span>سجلات فترات وساعات العمل السابقة</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400">
                  <tr className="border-b border-slate-800">
                    <th className="p-3">اسم الموظف</th>
                    <th className="p-3">المهمة المنفذة</th>
                    <th className="p-3">وقت البدء</th>
                    <th className="p-3">وقت الإكمال</th>
                    <th className="p-3">الساعات</th>
                    <th className="p-3">تكلفة الساعة</th>
                    <th className="p-3">التكلفة الإجمالية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {timeLogs.map(log => {
                    const matchedUser = users.find(u => u.id === log.userId);
                    return (
                      <tr key={log.id} className="hover:bg-slate-950/40 font-sans">
                        <td className="p-3 font-semibold text-white">{matchedUser?.name || "موظف متميز"}</td>
                        <td className="p-3 text-slate-400">{log.taskTitle}</td>
                        <td className="p-3 font-mono text-[11px]">{new Date(log.startTime).toLocaleTimeString("ar-EG")}</td>
                        <td className="p-3 font-mono text-[11px]">{new Date(log.endTime).toLocaleTimeString("ar-EG")}</td>
                        <td className="p-3 font-mono font-bold text-indigo-300">{log.hours} س</td>
                        <td className="p-3 font-mono">{log.costPerHour} EGP</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{(log.hours * log.costPerHour).toLocaleString()} ج.م</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeTab === "remote_dashboard" && (
        <div className="space-y-6">
          
          {/* Top Activity & Idle tracker diagnostics widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* GPS Compliance */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400 font-sans">تطابق الـ GPS الذاتي</span>
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold text-white">نشط (GPS مصادق)</div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">صيغ القاهرة / مصر المعتمدة</p>
              </div>
            </div>

            {/* Screenshot tracking count */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs">
                <Camera className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="text-slate-400 font-sans"> Screenshot Tracking لقطات فجائية</span>
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold text-slate-100">كل 10 دقائق (عشوائي)</div>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">مشغل وآمن على سرية البيانات</p>
              </div>
            </div>

            {/* Activity Indicator */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs">
                <BarChart3 className="w-5 h-5 text-yellow-500" />
                <span className="text-slate-400 font-sans">مؤشرات النشاط والركود</span>
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold text-white">92% نشاط فائق</div>
                <p className="text-[10px] text-indigo-400 mt-0.5">8% وقت فراغ معزول</p>
              </div>
            </div>

          </div>

          {/* Screenshot tracking snapshot gallery */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2.5">لقطات الشاشة التلقائية المثبتة المحدثة (مراقبة طاقم العمل عن بعد)</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans text-xs">
              
              <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-right space-y-2">
                <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150" alt="" className="w-full h-24 object-cover rounded border border-slate-800" />
                <div className="text-[10px] font-bold text-slate-200">أحمد سيد (المصمم)</div>
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>91% نشط</span>
                  <span>10:35 صباحاً</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-right space-y-2">
                <img src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=150" alt="" className="w-full h-24 object-cover rounded border border-slate-800" />
                <div className="text-[10px] font-bold text-slate-200">علي الشافعي (التسويق)</div>
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>96% نشط</span>
                  <span>11:12 صباحاً</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-right space-y-2">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150" alt="" className="w-full h-24 object-cover rounded border border-slate-800" />
                <div className="text-[10px] font-bold text-slate-200">أحمد سيد (المصمم)</div>
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>95% نشط</span>
                  <span>11:45 صباحاً</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-right space-y-2">
                <div className="w-full h-24 bg-slate-900 rounded border border-slate-800 flex items-center justify-center text-slate-600 font-mono text-[9px]">
                  IDLE MODE
                </div>
                <div className="text-[10px] font-bold text-slate-400">سارة حسن (HR)</div>
                <div className="flex justify-between text-[8px] text-slate-550 font-mono">
                  <span className="text-rose-450">مستكين / ركود</span>
                  <span>12:00 مساءً</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
