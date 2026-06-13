import React, { useState } from "react";
import { ClientCorp, Contract, Proposal, MarketingCampaign, User } from "../types";
import { syncERPCollection, sendWhatsAppNotification } from "../utils";
import { Users, FileText, Award, BarChart3, Plus, Search, Megaphone, Trash, CheckCircle, Smartphone } from "lucide-react";

interface MarketingModuleProps {
  currentUser: User;
  clients: ClientCorp[];
  contracts: Contract[];
  proposals: Proposal[];
  campaigns: MarketingCampaign[];
  onDataChanged: () => void;
}

export default function MarketingModule({
  currentUser,
  clients,
  contracts,
  proposals,
  campaigns,
  onDataChanged
}: MarketingModuleProps) {
  const [activeTab, setActiveTab] = useState<"clients" | "contracts" | "proposals" | "campaigns">("clients");

  // Client forms
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", company: "", email: "", phone: "", notes: "", status: "active" as const });

  // Contract forms
  const [showContractModal, setShowContractModal] = useState(false);
  const [newContract, setNewContract] = useState({ clientId: "", title: "", value: 0, startDate: "", endDate: "", status: "active" as const });

  // Proposal forms
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [newProposal, setNewProposal] = useState({ clientId: "", title: "", technicalDetails: "", financialDetails: "", value: 0, status: "submitted" as const });

  // Campaign forms
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    platform: "facebook" as const,
    budget: 0,
    spent: 0,
    leadsGenerated: 0,
    leadsTarget: 100,
    status: "active" as const
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.company) return;

    const updated = [...clients, { ...newClient, id: `c-${Date.now()}` }];
    const success = await syncERPCollection("clients", updated, currentUser.id, currentUser.name, `إضافة العميل الجديد "${newClient.name}" لشركة التسويق الرقمي.`);
    
    if (success) {
      setShowClientModal(false);
      setNewClient({ name: "", company: "", email: "", phone: "", notes: "", status: "active" });
      onDataChanged();
      // WhatsApp notify
      await sendWhatsAppNotification(newClient.phone, `أهلاً بك يا ${newClient.name} في مؤسسة حسام الورداني! تم إدراج ملف شركتك "${newClient.company}" بنجاح في نظام العمل السحابي.`, currentUser.id, currentUser.name);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    const success = await syncERPCollection("clients", updated, currentUser.id, currentUser.name, "مسح ملف عميل من قائمة عملاء التسويق الرقمي.");
    if (success) onDataChanged();
  };

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContract.clientId || !newContract.title) return;

    const updated = [...contracts, { ...newContract, id: `con-${Date.now()}` }];
    const success = await syncERPCollection("contracts", updated, currentUser.id, currentUser.name, `توثيق عقد تسويقي جديد بقيمة ${newContract.value} جنيهاً.`);
    
    if (success) {
      setShowContractModal(false);
      const matchedClient = clients.find(c => c.id === newContract.clientId);
      if (matchedClient) {
        await sendWhatsAppNotification(matchedClient.phone, `تم تفعيل عقدك الجديد بعنوان "${newContract.title}" بقيمة ${newContract.value} جنيهاً مصرياً. نظام حسام الورداني ERP.`, currentUser.id, currentUser.name);
      }
      setNewContract({ clientId: "", title: "", value: 0, startDate: "", endDate: "", status: "active" });
      onDataChanged();
    }
  };

  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposal.clientId || !newProposal.title) return;

    const updated = [...proposals, { ...newProposal, id: `prop-${Date.now()}` }];
    const success = await syncERPCollection("proposals", updated, currentUser.id, currentUser.name, `إنشاء عرض فني ومالي جديد للعميل.`);
    
    if (success) {
      setShowProposalModal(false);
      setNewProposal({ clientId: "", title: "", technicalDetails: "", financialDetails: "", value: 0, status: "submitted" });
      onDataChanged();
    }
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return;

    const updated = [...campaigns, { ...newCampaign, id: `cam-${Date.now()}` }];
    const success = await syncERPCollection("campaigns", updated, currentUser.id, currentUser.name, `إطلاق وإضافة حملة ممولة جديدة على منصة ${newCampaign.platform}.`);
    
    if (success) {
      setShowCampaignModal(false);
      setNewCampaign({ name: "", platform: "facebook", budget: 0, spent: 0, leadsGenerated: 0, leadsTarget: 100, status: "active" });
      onDataChanged();
    }
  };

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6" id="marketing-module-main">
      
      {/* Upper Navigation Tabs */}
      <div className="flex border-b border-slate-800 scroll-x-auto gap-1">
        <button
          onClick={() => { setActiveTab("clients"); setSearchTerm(""); }}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transition-all cursor-pointer ${
            activeTab === "clients" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة العملاء ({clients.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab("contracts"); setSearchTerm(""); }}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transition-all cursor-pointer ${
            activeTab === "contracts" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>إدارة العقود ({contracts.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab("proposals"); setSearchTerm(""); }}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transition-all cursor-pointer ${
            activeTab === "proposals" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>العروض الفنية والمالية</span>
        </button>
        <button
          onClick={() => { setActiveTab("campaigns"); setSearchTerm(""); }}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transition-all cursor-pointer ${
            activeTab === "campaigns" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>الحملات والسوشيال ميديا</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-9 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-indigo-500 text-right"
            id="marketing-search-input-field"
          />
          <Search className="w-4 h-4 absolute left-auto right-3 top-2.5 text-slate-500" />
        </div>

        {activeTab === "clients" && (
          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-sans transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        )}
        {activeTab === "contracts" && (
          <button
            onClick={() => setShowContractModal(true)}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-sans transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عقد جديد</span>
          </button>
        )}
        {activeTab === "proposals" && (
          <button
            onClick={() => setShowProposalModal(true)}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-sans transition"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء عرض أسعار</span>
          </button>
        )}
        {activeTab === "campaigns" && (
          <button
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-sans transition"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء حملة إعلانية</span>
          </button>
        )}
      </div>

      {/* Main tab sections */}
      {activeTab === "clients" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(c => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-sans uppercase font-bold ${
                    c.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                  }`}>
                    {c.status === "active" ? "نشط" : "معلق"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {c.id}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans mb-1">{c.name}</h3>
                <div className="text-xs text-indigo-400 text-slate-300 font-medium mb-3">{c.company}</div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4 bg-slate-950/45 p-2.5 rounded border border-slate-850">{c.notes}</p>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-2 flex justify-between items-center">
                <div className="text-[10px] text-slate-400 font-mono space-y-0.5 text-right">
                  <div>بريد: {c.email}</div>
                  <div>هاتف: {c.phone}</div>
                </div>
                <button
                  onClick={() => handleDeleteClient(c.id)}
                  className="p-1 px-2 border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 rounded transition text-xs"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "contracts" && (
        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-sans border-b border-slate-800">
              <tr>
                <th className="p-3">العميل</th>
                <th className="p-3">عنوان العقد</th>
                <th className="p-3">القيمة الكلية</th>
                <th className="p-3">تاريخ البدء</th>
                <th className="p-3">تاريخ الانتهاء</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {contracts.map(con => {
                const cli = clients.find(c => c.id === con.clientId);
                return (
                  <tr key={con.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 font-sans font-medium text-indigo-300">{cli ? cli.company : "غير معروف"}</td>
                    <td className="p-3 font-sans font-semibold">{con.title}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{con.value.toLocaleString()} j.m</td>
                    <td className="p-3 font-mono text-slate-400">{con.startDate}</td>
                    <td className="p-3 font-mono text-slate-400">{con.endDate}</td>
                    <td className="p-3">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-sans">
                        نشط وموثق
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "proposals" && (
        <div className="space-y-4">
          {proposals.map(p => {
            const cli = clients.find(c => c.id === p.clientId);
            return (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-sans">{p.title}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">العميل المستهدف: <span className="text-indigo-300 font-sans">{cli?.company || "غير محدد"}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 font-mono">{p.value.toLocaleString()} جنيهاً</div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-sans inline-block mt-1">
                      {p.status === "approved" ? "تم قبول العرض والتوثيق" : "قيد المراجعة والتقديم"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3 bg-slate-950/60 rounded border border-slate-850">
                    <div className="font-bold text-slate-300 mb-1">تفاصيل العرض الفني</div>
                    <p className="text-slate-400 leading-relaxed text-xs">{p.technicalDetails}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded border border-slate-850">
                    <div className="font-bold text-slate-300 mb-1">الهيكلة المالية والعمولة</div>
                    <p className="text-slate-400 leading-relaxed text-xs">{p.financialDetails}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map(cam => {
            const progress = Math.round((cam.spent / cam.budget) * 100);
            return (
              <div key={cam.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-slate-950 border border-slate-800 text-[10px] px-2.5 py-0.5 rounded uppercase font-bold text-slate-300 font-mono">
                      {cam.platform}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-sans ${
                      cam.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-300"
                    }`}>
                      {cam.status === "active" ? "جارية الآن" : "مكتملة"}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 font-sans mb-3 text-right">{cam.name}</h3>

                  {/* Campaign stats bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[11px] font-sans">
                      <span className="text-slate-400">ميزانية الصرف: <b className="text-slate-200 font-mono">{cam.spent.toLocaleString()} / {cam.budget.toLocaleString()} EGP</b></span>
                      <span className="text-indigo-400 font-mono font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded border border-slate-850 mb-3 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">العملاء المهتمين Leads</div>
                      <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">{cam.leadsGenerated}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">المعدل المستهدف Target</div>
                      <div className="text-sm font-bold text-slate-300 font-mono mt-0.5">{cam.leadsTarget || 100}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2.5 mt-1 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">حساب نقرات إرشادية</span>
                  <span className="text-emerald-400 font-mono font-bold">CPL: {Math.round(cam.spent / (cam.leadsGenerated || 1))} جنيهاً</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddClient} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إضافة ملف عميل تسويق جديد</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم العميل الشخصي</label>
                <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">اسم الشركة / المشروع التجاري</label>
                <input required type="text" value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">البريد الإلكتروني</label>
                <input required type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف ورقم واتساب للتنبيهات</label>
                <input required type="text" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="+201..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-left tracking-wider focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">ملاحظات و حزمة الخدمات المطلوبة</label>
                <textarea rows={3} value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">إدراج وحفظ</button>
              <button type="button" onClick={() => setShowClientModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {showContractModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddContract} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">توثيق عقد تسويق جديد</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر العميل</label>
                <select required value={newContract.clientId} onChange={e => setNewContract({...newContract, clientId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500">
                  <option value="">-- اختر من القائمة --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company} - {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">عنوان العقد التجاري</label>
                <input required type="text" value={newContract.title} onChange={e => setNewContract({...newContract, title: e.target.value})} defaultValue="إدارة محتوى كامل" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">القيمة المالية الإجمالية للعقد (EGP)</label>
                <input required type="number" value={newContract.value} onChange={e => setNewContract({...newContract, value: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ البدء</label>
                  <input required type="date" value={newContract.startDate} onChange={e => setNewContract({...newContract, startDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ الانتهاء</label>
                  <input required type="date" value={newContract.endDate} onChange={e => setNewContract({...newContract, endDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">تثبيت وتفعيل</button>
              <button type="button" onClick={() => setShowContractModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {showProposalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddProposal} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إنشاء عرض فني ومالي جديد</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر العميل</label>
                <select required value={newProposal.clientId} onChange={e => setNewProposal({...newProposal, clientId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none focus:border-indigo-500">
                  <option value="">-- اختر العميل المقترح له --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">عنوان العرض</label>
                <input required type="text" value={newProposal.title} onChange={e => setNewProposal({...newProposal, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">التفاصيل الفنية وحزم العمل</label>
                <textarea required rows={2} value={newProposal.technicalDetails} onChange={e => setNewProposal({...newProposal, technicalDetails: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">الخطة المالية والأسعار بالعملة والمشط</label>
                <textarea required rows={2} value={newProposal.financialDetails} onChange={e => setNewProposal({...newProposal, financialDetails: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">القيمة التقديرية المجمعة للأعمال (EGP)</label>
                <input required type="number" value={newProposal.value} onChange={e => setNewProposal({...newProposal, value: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">إرسال العرض</button>
              <button type="button" onClick={() => setShowProposalModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddCampaign} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إطلاق حملة تسويقية جديدة</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم الحملة الإعلانية</label>
                <input required type="text" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">المنصة التسويقية</label>
                  <select value={newCampaign.platform} onChange={e => setNewCampaign({...newCampaign, platform: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none">
                    <option value="facebook">فيسبوك</option>
                    <option value="google">إعلانات جوجل</option>
                    <option value="instagram">إنستغرام</option>
                    <option value="tiktok">تيك توك</option>
                    <option value="snapchat">سناب شات</option>
                    <option value="linkedin">لينكد إن</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ميزانية الصرف الكلية (EGP)</label>
                  <input required type="number" value={newCampaign.budget} onChange={e => setNewCampaign({...newCampaign, budget: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">إجمالي ما تم إنفاقه</label>
                  <input required type="number" value={newCampaign.spent} onChange={e => setNewCampaign({...newCampaign, spent: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">العملاء المقدر الحصول عليهم (Target)</label>
                  <input required type="number" value={newCampaign.leadsTarget} onChange={e => setNewCampaign({...newCampaign, leadsTarget: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">بدء التشغيل الفوري</button>
              <button type="button" onClick={() => setShowCampaignModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
