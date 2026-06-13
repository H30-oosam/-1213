import React, { useState, useEffect } from "react";
import { askAICopilot, requestAIReport } from "../utils";
import { User, ERPConfig } from "../types";
import { Send, Bot, Sparkles, BookOpen, AlertCircle, FileText, Download, Loader2 } from "lucide-react";

interface AIModuleProps {
  currentUser: User;
  systemConfig: ERPConfig;
}

export default function AIModule({ currentUser, systemConfig }: AIModuleProps) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string; timestamp: string }>>([
    {
      role: "assistant",
      text: `أهلاً بك يا ${currentUser.name}. أنا المساعد الذكي لمؤسسة حسام الورداني لخدمات الأعمال والتدريب. كيف يمكنني إعطاؤك اقتراحات تسويقية أو مالية أو مساعدتك اليوم كـ (${currentUser.role})؟`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric" })
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Analytics report states
  const [reportType, setReportType] = useState<"marketing" | "hr" | "finance">("marketing");
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [compiledReport, setCompiledReport] = useState<string>("");

  useEffect(() => {
    // Generate default marketing report on first view
    handleGenerateReport("marketing");
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    const timeNow = new Date().toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric" });
    
    setChatMessages(prev => [...prev, { role: "user", text: userMsg, timestamp: timeNow }]);
    setChatInput("");
    setIsChatLoading(true);

    const historyPayload = chatMessages.map(msg => ({ role: msg.role, text: msg.text }));
    const aiResponse = await askAICopilot(userMsg, currentUser.name, currentUser.role, historyPayload);

    setChatMessages(prev => [...prev, { role: "assistant", text: aiResponse, timestamp: timeNow }]);
    setIsChatLoading(false);
  };

  const handleGenerateReport = async (type: "marketing" | "hr" | "finance") => {
    setReportType(type);
    setIsReportLoading(true);
    const reportText = await requestAIReport(type);
    setCompiledReport(reportText);
    setIsReportLoading(false);
  };

  const downloadReportText = () => {
    const blob = new Blob(["\ufeff" + compiledReport], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AI_Report_${reportType}_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-module-viewport">
      
      {/* Dynamic Report compiler */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100 font-sans">توليد تقارير أداء ومقترحات المبيعات بالذكاء الاصطناعي</h2>
          </div>
          <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded">خاص بالأعمال</span>
        </div>

        <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
          يقوم محرك الذكاء الاصطناعي بجمع البيانات الحية للحملات الإعلانية ومراقبة المهام، الأرباح والخسائر، وساعات عمل الموظفين ليصيغ لك توصيات حية ونقاط قوة ونقاط خلل مع اقتراحات لرفع المبيعات.
        </p>

        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => handleGenerateReport("marketing")}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
              reportType === "marketing"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>كفاءة التسويق</span>
          </button>
          <button
            onClick={() => handleGenerateReport("hr")}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
              reportType === "hr"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>إنتاجية الموظفين</span>
          </button>
          <button
            onClick={() => handleGenerateReport("finance")}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
              reportType === "finance"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>الأرباح والتحليل المالي</span>
          </button>
        </div>

        {/* Compiled Output panel */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 relative overflow-y-auto max-h-[480px]">
          {isReportLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 gap-3 z-10">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <div className="text-xs text-slate-300 font-sans">جاري استدعاء البيانات الحية وترميز التقرير...</div>
            </div>
          ) : null}

          <div className="text-slate-200 text-xs font-mono whitespace-pre-line leading-relaxed pb-4">
            {compiledReport ? compiledReport : "اختر نوع تقرير للبدء بالتحليل التلقائي بذكاء الآلة."}
          </div>

          {compiledReport && (
            <div className="flex justify-end pt-4 border-t border-slate-800 mt-2">
              <button
                onClick={downloadReportText}
                className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير كملف نصي</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Internal chatbot */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col shadow-xl h-[580px]">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Bot className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">مساعد الورداني الذكي Copilot</h2>
            <p className="text-[10px] text-slate-400">شات بوت داخلي تفاعلي للموظفين واستشارات المبيعات</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                {msg.role === "assistant" ? (
                  <>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    <span className="text-[10px] font-bold text-indigo-400">ذكاء اصطناعي</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-amber-500">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </>
                )}
              </div>
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-750"
                    : "bg-indigo-600/20 text-indigo-100 rounded-tr-none border border-indigo-500/25"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>الذكاء الاصطناعي يفكر ويكتب...</span>
            </div>
          )}
        </div>

        {/* Chat sender */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatChatText(e.target.value)}
            disabled={isChatLoading}
            placeholder="اسأل المساعد عن المبيعات، الفواتير، الكورسات أو خطط الحملات..."
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-sans focus:outline-none focus:border-indigo-500 text-right"
            id="ai-chat-input-field"
          />
          <button
            type="submit"
            disabled={isChatLoading || !chatInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-2.5 rounded-lg transition flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4 transform rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );

  function setChatChatText(v: string) {
    setChatInput(v);
  }
}
