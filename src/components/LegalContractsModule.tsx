import React, { useState } from "react";
import { User, ClientCorp } from "../types";
import { syncERPCollection } from "../utils";
import { FileText, Plus, ShieldCheck, HelpCircle, Bot, Sparkles, Printer, UserCheck, Scale, ScrollText, AlertTriangle } from "lucide-react";

interface LegalContract {
  id: string;
  title: string;
  type: "client" | "employee" | "nda" | "warning";
  partyA: string; // usually company
  partyB: string; // user or client name
  content: string;
  value?: number;
  date: string;
  status: "active" | "finalized" | "warning_issued";
}

interface LegalContractsModuleProps {
  currentUser: User;
  users: User[];
  clients: ClientCorp[];
  onDataChanged: () => void;
}

export default function LegalContractsModule({
  currentUser,
  users,
  clients,
  onDataChanged
}: LegalContractsModuleProps) {
  const [contracts, setContracts] = useState<LegalContract[]>([
    { id: "leg-1", title: "اتفاقية الخدمة التسويقية وصنع المحتوى الرقمي", type: "client", partyA: "مؤسسة حسام الورداني", partyB: "مستشفى الشفاء التخصصي", value: 22000, date: "2026-06-05", status: "active", content: "تلتزم مؤسسة حسام الورداني بتصوير 12 فيديو ريلز طبي احترافي وإدارة الحسابات الرسمية لمستشفى الشفاء مقابل دفعات شهرية منتظمة بقيمة 22,000 ج.م." },
    { id: "leg-2", title: "إنذار إداري رسمي لتكرار تغيب أو تأخير العمل", type: "warning", partyA: "مؤسسة حسام الورداني", partyB: "أحمد سيد (مصمم)", date: "2026-06-12", status: "warning_issued", content: "توجه إدارة الموارد البشرية هذا الإنذار الرسمي نظراً لغياب الموظف دون عذر مسبق لمدة تزيد عن المسموح به قانونياً باللائحة التشغيلية." }
  ]);

  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  
  // AI assist state
  const [aiPrompt, setAiPrompt] = useState<string>("اكتب عقد عدم إفشاء أسرار (NDA) بسيط للموظف علي الشافعي");
  const [aiDraft, setAiDraft] = useState<string>("");
  const [isDrafting, setIsDrafting] = useState<boolean>(false);

  // New Contract state
  const [newContract, setNewContract] = useState({
    title: "",
    type: "client" as const,
    partyA: "مؤسسة حسام الورداني للتسويق الرقمي",
    partyB: "",
    content: "",
    value: 0
  });

  const handleDraftLegalWithAI = async () => {
    setIsDrafting(true);
    setAiDraft("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `أنت مستشار قانوني مالي للشركات بالجمهورية المصرية. اكتب صيغة قانونية رسمية فاخرة بالغة العربية الرصينة من أجل: "${aiPrompt}". تضمن البنود والالتزامات والشرط الجزائي وتوقيعات العاقدين.`,
          userRole: currentUser.role,
          userName: currentUser.name
        })
      });
      const data = await response.json();
      if (data.response) {
        setAiDraft(data.response);
        // Put in modal content to let them modify before saving
        setNewContract(prev => ({
          ...prev,
          title: `عقد أو قرار صادر بخصوص: ${aiPrompt.substring(0, 30)}`,
          content: data.response
        }));
      }
    } catch (e) {
      setAiDraft("عقود عدم الإفشاء (NDA):\nيتعهد الطرف الثاني المحترم بالحفاظ على سرية وحصانة كلمات المرور وجميع الفيديوهات وحسابات فيسبوك الخاصة بالعملاء المفررة، وأي خرق لهذه السرية يعرضه للمسؤولة القضائية الفورية.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContract.title || !newContract.content) return;

    const contractPayload: LegalContract = {
      ...newContract,
      id: `leg-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      status: newContract.type === "warning" ? "warning_issued" : "active"
    };

    const updated = [contractPayload, ...contracts];
    setContracts(updated);
    setShowAddModal(false);
    setSelectedContractId(contractPayload.id);
    
    // Sync with server
    await syncERPCollection("legalContracts", updated, currentUser.id, currentUser.name, `إصدار وثيقة أو إنذار رسمي قانوني: "${newContract.title}".`);
    onDataChanged();
  };

  const activeContract = contracts.find(c => c.id === selectedContractId) || contracts[0];

  return (
    <div className="space-y-6 text-right" id="legal-contracts-pro">
      
      {/* Visual Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-100 font-sans">إدارة العقود القانونية واللوائح والإنذارات الرسمية (Legal Hub)</h3>
          <p className="text-xs text-slate-400 font-sans">
            من هنا يمكنك تحرير عقود عملاء الوكالة، صياغة لوائح كتم الأسرار (NDAs)، وتعميم القرارات والإنذارات الإدارية والجزاءات بحق الطاقم المقصر.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>تحرير وصياغة وثيقة قانونية</span>
        </button>
      </div>

      {/* Embedded Intelligent Legal Advisor Drawer */}
      <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/10 space-y-3 font-sans text-xs relative overflow-hidden text-right">
        <div className="flex items-center gap-1.5 justify-end text-indigo-400 font-bold text-xs uppercase">
          <Bot className="w-4 h-4 animate-bounce" />
          <span>المساعد الذكي القانوني ورسام العقود (AI Legal Assistant)</span>
        </div>
        
        <p className="text-slate-400 text-[10px] leading-relaxed">
          اكتب للذكاء الاصطناعي لوصف طبيعة العقد أو الإنذار المطلوب (مثال: "صيغة إنذار نهائي لتسريب حملات" أو "عقود رعاية الأكاديمية")، وسيقوم بإنشاء المادة وتعبئتها داخل محرر العقود لراحتك.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder="مثال: اكتب عقد عدم إفشاء أسرار (NDA) للموظف علي الشافعي..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 outline-none text-right placeholder-slate-600"
          />
          <button
            onClick={handleDraftLegalWithAI}
            disabled={isDrafting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-bold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDrafting ? "جاري التحرير الفقهي..." : "صغ المادة فوراً"}</span>
          </button>
        </div>
      </div>

      {/* Main double column Workspace - Lists (4 cols) & Stamp Preview (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Document list (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3 shadow-lg">
          <h4 className="text-xs font-bold text-slate-100 pb-2 border-b border-slate-850">ارشيف الأوراق واللوائح</h4>
          
          <div className="space-y-2.5 max-h-[450px] overflow-y-auto font-sans">
            {contracts.map(cnt => (
              <button
                key={cnt.id}
                onClick={() => setSelectedContractId(cnt.id)}
                className={`w-full text-right p-3 rounded-lg border transition text-xs block ${
                  selectedContractId === cnt.id ? "bg-indigo-605 bg-indigo-600/10 border-indigo-500/40 text-indigo-400" : "bg-slate-950 border-slate-850 text-slate-350 hover:bg-slate-900"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-500 font-mono">{cnt.date}</span>
                  <span className={`px-1 rounded text-[8px] uppercase font-mono ${cnt.type === "warning" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {cnt.type}
                  </span>
                </div>
                <div className="font-bold truncate">{cnt.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Corporate Stamp layout preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeContract ? (
            <div className="bg-white border-2 border-slate-150 rounded-xl p-6.5 shadow-2xl text-slate-800 space-y-5" id="corporate-legal-sheet">
              
              {/* Slip header */}
              <div className="flex justify-between items-center border-b-2 border-slate-150 pb-4">
                <div className="text-left font-mono text-[9px] text-slate-400">
                  REF: CORP-LEG-{activeContract.id.substring(4)}
                </div>
                <div className="text-right">
                  <div className="text-slate-900 font-extrabold text-[13px] tracking-wide">مكتب الشؤون القانونية والمصادقات</div>
                  <div className="text-indigo-600 font-bold text-[9px] mt-0.5">مؤسسة حسام الورداني لحلول نمو الأعمال</div>
                </div>
              </div>

              {/* Title & info */}
              <div className="space-y-3">
                <h3 className="text-center font-bold text-slate-905 text-base border-b pb-2 text-slate-900 italic font-sans">{activeContract.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 text-[9px] bg-slate-50 p-3 rounded border border-slate-150 font-sans leading-relaxed text-right">
                  <div>
                    <span className="text-slate-400 block mb-0.5">الطرف الثاني (العميل أو الموظف):</span>
                    <strong className="text-slate-900 text-xs block">{activeContract.partyB}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">الطرف الأول (محرر الوثيقة):</span>
                    <strong className="text-slate-900 text-xs block">{activeContract.partyA}</strong>
                  </div>
                </div>

                {/* Main Legal Paragraph text content */}
                <div className="text-slate-700 text-[11px] leading-relaxed font-sans whitespace-pre-wrap py-3 border-b text-right border-slate-100 min-h-[140px]">
                  {activeContract.content}
                </div>
              </div>

              {/* Stamp and signature placeholders */}
              <div className="flex justify-between items-end pt-4 font-sans">
                
                {/* Official Stamp */}
                <div className="w-18 h-18 rounded-full border-4 border-dashed border-indigo-700/60 flex items-center justify-center text-center font-bold text-indigo-700/80 text-[7px] leading-none select-none rotate-12">
                  ختم معتمد<br/>
                  مؤسسة الورداني<br/>
                  Cairo/Egypt
                </div>

                {/* Party Signatures */}
                <div className="text-right text-[9px] space-y-1">
                  <div>توقيع الطرف الأول: <span className="font-mono font-bold text-indigo-600 italic block">CEO Elwardany ✔</span></div>
                  <div>توقيع واستلام الطرف الثاني: <span className="text-slate-400 block">................................................</span></div>
                </div>

              </div>

              {/* Actions */}
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة وإرسال كملف PDF رسمي</span>
              </button>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-xs py-14 space-y-1.5 font-sans">
              <ScrollText className="w-10 h-10 text-indigo-400/50 mx-auto animate-bounce" />
              <p>يرجى تحديد وثيقة أو عقد متاح للأرشفة والاستماع.</p>
            </div>
          )}
        </div>

      </div>

      {/* Manual Document Creator Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddContract} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-lg text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-801 pb-2 flex items-center justify-end gap-1.5 font-sans">
              <span>صياغة وثيقة قانونية جديدة للشركة</span>
              <Scale className="w-5 h-5 text-indigo-400" />
            </h3>

            <div className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">اسم الوثيقة أو موضوعها</label>
                <input required type="text" value={newContract.title} onChange={e => setNewContract({...newContract, title: e.target.value})} placeholder="اتفاقية كتم أسرار (NDA) - علي كاتب محتوى..." className="w-full bg-slate-950 border border-slate-804 rounded p-2 text-slate-200 text-right" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">نوع الوثيقة</label>
                  <select value={newContract.type} onChange={e => setNewContract({...newContract, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200">
                    <option value="client">عقد خدمة عميل (Client Contract)</option>
                    <option value="employee">عقد توظيف طاقم (Employee Contract)</option>
                    <option value="nda">اتفاقية كتم الأسرار (NDA Checklist)</option>
                    <option value="warning">إنذار وجزاء رسمي (Warning Letter)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الطرف الثاني الفعلي (Party B)</label>
                  <input required type="text" value={newContract.partyB} onChange={e => setNewContract({...newContract, partyB: e.target.value})} placeholder="أحمد سيد (المصمم) أو المستشفى" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
                </div>
              </div>

              <div>
                <label className="block text-slate-404 text-slate-400 mb-1 font-sans">نص الشرح القانوني والبنود المتفق عليها</label>
                <textarea required value={newContract.content} onChange={e => setNewContract({...newContract, content: e.target.value})} rows={6} placeholder="اكتب دياجة العقد والمادة هنا بالتفصيل الموحد..." className="w-full bg-slate-950 border border-slate-801 rounded p-2 text-right text-slate-200" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold px-4 py-2 rounded">توقيع ونشر بالأرشيف</button>
              <button type="button" onClick={() => setShowAddModal(false)} className="bg-slate-800 hover:bg-slate-705 text-slate-400 text-xs px-4 py-2 rounded font-sans">إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
