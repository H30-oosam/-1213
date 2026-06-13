import React, { useState } from "react";
import { User } from "../types";
import { syncERPCollection } from "../utils";
import { ClipboardCheck, Plus, CheckCircle, XCircle, Clock, ShieldAlert, Award, FileSpreadsheet, Send } from "lucide-react";

interface ApprovalRequest {
  id: string;
  userId: string;
  type: "leave" | "advance" | "purchase";
  title: string;
  details: string;
  amountOrDays: number;
  status: "pending" | "approved" | "rejected";
  approverPath: string[]; // List of roles/names who approved
  date: string;
}

interface WorkflowApprovalsProps {
  currentUser: User;
  users: User[];
  onDataChanged: () => void;
}

export default function WorkflowApprovalsModule({
  currentUser,
  users,
  onDataChanged
}: WorkflowApprovalsProps) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    { id: "aprv-1", userId: "u-8", type: "leave", title: "طلب إجازة عارضة طارئة", details: "رعاية وعلاج أفراد الأسرة المقربين من الدرجة الأولى لمدة 3 أيام.", amountOrDays: 3, status: "pending", approverPath: [], date: "2026-06-12" },
    { id: "aprv-2", userId: "u-2", type: "advance", title: "سلفة نقدية طارئة قبل الراتب بالدفتري", details: "مواجهة نفقات شخصية عائلية مفاجئة بالجمهورية المصرية.", amountOrDays: 1500, status: "approved", approverPath: ["مدير الملقمات المالي", "م. حسام الورداني (CEO)"], date: "2026-06-11" },
    { id: "aprv-3", userId: "u-8", type: "purchase", title: "شراء رخصة اشتراك سنوي لموقع Canva Pro", details: "مطلوبة لتصميم بوسترات السوشيال ميديا لمجمع الشروق العقاري.", amountOrDays: 2400, status: "pending", approverPath: [], date: "2026-06-13" }
  ]);

  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  
  // New request form state
  const [newReq, setNewReq] = useState({
    type: "leave" as const,
    title: "",
    details: "",
    amountOrDays: 1,
  });

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.title || !newReq.details) return;

    const requestPayload: ApprovalRequest = {
      ...newReq,
      id: `aprv-${Date.now()}`,
      userId: currentUser.id,
      status: "pending",
      approverPath: [],
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [requestPayload, ...requests];
    setRequests(updated);
    setShowRequestModal(false);
    setNewReq({ type: "leave", title: "", details: "", amountOrDays: 1 });

    // Sync database update
    await syncERPCollection("approvalRequests", updated, currentUser.id, currentUser.name, `تقديم طلب محاسبي معلق: "${newReq.title}" في فرع الموافقات والمطالعات.`);
    onDataChanged();
  };

  const processApprovalAction = async (requestId: string, action: "approve" | "reject") => {
    const updated = requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: action === "approve" ? "approved" as const : "rejected" as const,
          approverPath: [...req.approverPath, `${currentUser.name} (${currentUser.role})`]
        };
      }
      return req;
    });

    setRequests(updated);
    
    // Sync to database
    await syncERPCollection("approvalRequests", updated, currentUser.id, currentUser.name, `مصادقة الطلبات: تم ${action === "approve" ? "الموافقة على" : "رفض"} الطلب رقم ${requestId} بواسطة ${currentUser.name}.`);
    onDataChanged();
  };

  return (
    <div className="space-y-6 text-right" id="workflow-approvals-suite">
      
      {/* Intro upper header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-100 font-sans">نظام مهندسة الموافقات والطلبات متعدد المستويات (Approvals Board)</h3>
          <p className="text-xs text-slate-400 font-sans">
            يربط هذا القسم طلب الإجازات، السلف الطارئة، وفواتير المشتريات الإعلانية بمسارات تدقيق متعددة المستويات لتأكيد الرشاقة المالية.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>تقديم طلب تظلم أو مشاركة جديد</span>
        </button>
      </div>

      {/* Grid listing of approvals requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map(req => {
          const applicant = users.find(u => u.id === req.userId);
          const needsCEOAction = req.status === "pending" && ["admin", "hr_manager", "accountant"].includes(currentUser.role);
          
          return (
            <div key={req.id} className="bg-slate-900 border border-slate-808 border-slate-800 p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono border ${
                    req.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    req.status === "rejected" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                  }`}>
                    {req.status === "approved" ? "موافق ومعتمد" : req.status === "rejected" ? "مرفوض نهائياً" : "بانتظار المصادقة"}
                  </span>
                  
                  <span className="bg-slate-950 px-2 py-0.5 border border-slate-850 text-indigo-400 rounded text-[10px] font-mono font-bold uppercase">
                    {req.type === "leave" ? "إعفاءات وإجازات" : req.type === "advance" ? "طلب سلف نقدية" : "شراء وتجهيز معدات"}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 font-sans mb-1 text-right">{req.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{req.details}</p>

                {/* Amount details */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[11px] mt-3 font-mono flex justify-between items-center">
                  <span className="text-slate-100 font-bold">
                    {req.type === "leave" ? `${req.amountOrDays} أيام إجازة` : `${req.amountOrDays.toLocaleString()} ج.م مصروف`}
                  </span>
                  <span className="text-slate-500">الحجم المقدر للطلب:</span>
                </div>
              </div>

              {/* Approval log trail path */}
              <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-2">
                <div className="text-[9px] text-slate-500">مسار وموظفي الاعتماد للطلب الحالية:</div>
                <div className="flex flex-wrap gap-1">
                  {req.approverPath.length > 0 ? (
                    req.approverPath.map((apr, idx) => (
                      <span key={idx} className="bg-indigo-950/40 text-indigo-300 text-[9px] px-2 py-0.5 rounded border border-indigo-500/20 font-sans">
                        ✔ {apr}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-650 text-[9px] text-slate-500 font-sans italic">لا يوجد مصادقات أولية من المسيرين...</span>
                  )}
                </div>

                {/* Approve triggers */}
                {needsCEOAction && (
                  <div className="flex gap-2 pt-2 text-xs">
                    <button
                      onClick={() => processApprovalAction(req.id, "approve")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-sans py-1.5 rounded-lg font-bold"
                    >
                      اعتماد وموافقة
                    </button>
                    <button
                      onClick={() => processApprovalAction(req.id, "reject")}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-sans py-1.5 rounded-lg"
                    >
                      رفض الطلب
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddRequest} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2 font-sans flex items-center justify-end gap-1.5">
              <span>تقديم طلب محاسبي معلق للمراجعة</span>
              <ClipboardCheck className="w-5 h-5 text-indigo-400" />
            </h3>

            <div className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">نوع المعاملة أو الطلب</label>
                <select value={newReq.type} onChange={e => setNewReq({...newReq, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none text-slate-200">
                  <option value="leave">طلب إجازات / غيابات عذر (Leave)</option>
                  <option value="advance">سلف طارئة مستقطعة من الراتب (Advance)</option>
                  <option value="purchase">مشتريات إعلانية وتجهيزات (Purchase)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">عنوان الطلب بموجز</label>
                <input required type="text" value={newReq.title} onChange={e => setNewReq({...newReq, title: e.target.value})} placeholder="طلب سلفة لتكاليف معالجة شخصية..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right font-sans" />
              </div>

              <div>
                <label className="block text-slate-405 mb-1 text-slate-404">الحجم المطلوب (الأيام للإجازة / الجنيهات المالية)</label>
                <input required type="number" value={newReq.amountOrDays} onChange={e => setNewReq({...newReq, amountOrDays: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-slate-200 text-right" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الشرح التفصيلي للغرض والموجبات</label>
                <textarea required value={newReq.details} onChange={e => setNewReq({...newReq, details: e.target.value})} rows={3} placeholder="اكتب مبررات القرار بوضوح للمدير والمحاسبة..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-right font-sans" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold px-4 py-2 rounded">إرسال الطلب للمسؤول</button>
              <button type="button" onClick={() => setShowRequestModal(false)} className="bg-slate-800 hover:bg-slate-705 text-slate-400 text-xs px-4 py-2 rounded font-sans">إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
