import React, { useState } from "react";
import { User } from "../types";
import { syncERPCollection } from "../utils";
import { Computer, Plus, UserCheck, Calendar, ShieldAlert, BadgeInfo, Trash, Search, ClipboardList } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  category: "laptop" | "phone" | "camera" | "screen" | "sim_card" | "other";
  serialNo: string;
  custodianId: string; // User ID
  handoverDate: string;
  condition: "excellent" | "good" | "needs_repair" | "lost";
  notes: string;
}

interface AssetsModuleProps {
  currentUser: User;
  users: User[];
  onDataChanged: () => void;
}

export default function AssetsModule({
  currentUser,
  users,
  onDataChanged
}: AssetsModuleProps) {
  const [assets, setAssets] = useState<Asset[]>([
    { id: "ast-1", name: "كاميرا سوني Sony A7 III الاحترافية للتصوير", category: "camera", serialNo: "SN-934892", custodianId: "u-8", handoverDate: "2026-02-15", condition: "excellent", notes: "خاصة بفيديوهات مستشفى الشفاء وريلز الأكاديمية." },
    { id: "ast-2", name: "لابتوب لينوفو ليجن كور Legion i7 16GB", category: "laptop", serialNo: "SN-88234", custodianId: "u-8", handoverDate: "2026-03-01", condition: "good", notes: "جهاز المونتاج الرئيسي لشركة التسويق." },
    { id: "ast-3", name: "خط اتصالات بزنس مفتوح فودافون مصر", category: "sim_card", serialNo: "SN-010029", custodianId: "u-2", handoverDate: "2026-01-10", condition: "excellent", notes: "رقاقة الربط بالـ WhatsApp Business API الخاص بالنظام." }
  ]);

  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // New asset form state
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "laptop" as const,
    serialNo: "",
    custodianId: "",
    handoverDate: "",
    condition: "excellent" as const,
    notes: ""
  });

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.custodianId) return;

    const updated = [
      ...assets,
      {
        ...newAsset,
        id: `ast-${Date.now()}`
      }
    ];

    setAssets(updated);
    setShowAssetModal(false);
    setNewAsset({ name: "", category: "laptop", serialNo: "", custodianId: "", handoverDate: "", condition: "excellent", notes: "" });

    // Sync asset database update
    await syncERPCollection("assets", updated, currentUser.id, currentUser.name, `مسؤول العهدة المضافة: تم إسناد عهدة جديدة "${newAsset.name}" للموظف بنجاح.`);
    onDataChanged();
  };

  const handleDeleteAsset = async (id: string) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    await syncERPCollection("assets", updated, currentUser.id, currentUser.name, "تحديث عهد الموظفين وسحب أصول تسويقية.");
    onDataChanged();
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.serialNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right" id="assets-management-suite">
      
      {/* Upper info card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-100 font-sans">نظام إدارة وجرد الأصول والعهدة المكتسبة للشركة (Assets Module)</h3>
          <p className="text-xs text-slate-400 font-sans">
            تتبع الحواسيب المحمولة، كاميرات التصوير الإعلاني، بطاقات SIM، والشاشات الموزعة على طاقم العمل عن بعد بموثوقية كاملة.
          </p>
        </div>
        <button
          onClick={() => setShowAssetModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>توقيع وإضافة عهدة جديدة</span>
        </button>
      </div>

      {/* List controls */}
      <div className="flex gap-4">
        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-850 p-2 flex items-center justify-between">
          <input
            type="text"
            placeholder="ابحث بالاسم أو الرقم السري للعهدة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-200 outline-none w-full text-right font-sans pr-2"
          />
          <Search className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Assets table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="p-3">اسم الأصل / العهدة</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">الرقم السري</th>
                <th className="p-3">المستلم والمسؤول</th>
                <th className="p-3">تاريخ التسليم</th>
                <th className="p-3">حالة الأصل الفنية</th>
                <th className="p-3 text-center">الإجراء الفني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-305 text-slate-300 font-sans">
              {filteredAssets.map(asset => {
                const custodian = users.find(u => u.id === asset.custodianId);
                return (
                  <tr key={asset.id} className="hover:bg-slate-950/40">
                    <td className="p-3">
                      <div>
                        <div className="font-bold text-slate-100">{asset.name}</div>
                        {asset.notes && <div className="text-[10px] text-slate-500 mt-0.5">{asset.notes}</div>}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-950 text-indigo-400 px-2 py-0.5 border border-slate-800 rounded font-mono uppercase text-[9px]">
                        {asset.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">{asset.serialNo}</td>
                    <td className="p-3 font-semibold text-slate-200">{custodian ? custodian.name : "المخزن العام"}</td>
                    <td className="p-3 font-mono text-indigo-300">{asset.handoverDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        asset.condition === "excellent" ? "bg-emerald-500/10 text-emerald-400" :
                        asset.condition === "good" ? "bg-blue-500/10 text-blue-400" :
                        asset.condition === "needs_repair" ? "bg-amber-500/10 text-amber-500 animate-pulse" :
                        "bg-rose-500/10 text-rose-450 text-rose-400"
                      }`}>
                        {asset.condition === "excellent" ? "ممتازة جداً" :
                         asset.condition === "good" ? "مستعمل نظيف" :
                         asset.condition === "needs_repair" ? "بانتظار الصيانة" : "مفقود أو تالف"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-rose-500 hover:text-rose-400 font-semibold px-2"
                      >
                        إلغاء وسحب العهدة
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddAsset} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-105 border-b border-slate-800 pb-2 flex items-center justify-end gap-1.5 font-sans">
              <span>توقيع وإسناد عهدة جديدة للموظف</span>
              <Computer className="w-5 h-5 text-indigo-400" />
            </h3>

            <div className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">اسم العهدة بالتفصيل</label>
                <input required type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="لابتوب ماك بوك برو M3 إصدار 2026..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">نوع الأصل</label>
                  <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2">
                    <option value="laptop">حاسوب محمول (Laptop)</option>
                    <option value="phone">هاتف خلوي (Phone)</option>
                    <option value="camera">كاميرا وثائقية (Camera)</option>
                    <option value="screen">شاشة مراقبة (Screen)</option>
                    <option value="sim_card">شريحة أعمال (SIM Card)</option>
                    <option value="other">ملحق آخر (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الرقم التسلسلي (S/N)</label>
                  <input required type="text" value={newAsset.serialNo} onChange={e => setNewAsset({...newAsset, serialNo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-left" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">الموظف الحاضن (Custodian)</label>
                  <select required value={newAsset.custodianId} onChange={e => setNewAsset({...newAsset, custodianId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded">
                    <option value="">-- اختر الموظف --</option>
                    {users.filter(u => u.role !== "client" && u.role !== "student").map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ التسليم والترحيب</label>
                  <input required type="date" value={newAsset.handoverDate} onChange={e => setNewAsset({...newAsset, handoverDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">حالة العهدة الأولية</label>
                <select value={newAsset.condition} onChange={e => setNewAsset({...newAsset, condition: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2">
                  <option value="excellent">جديدة وممتازة جداً (Excellent)</option>
                  <option value="good">مستعملة نظيفة وصالحة (Good)</option>
                  <option value="needs_repair">تتطلب صيانة تمهيدية (Needs Repair)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-405 mb-1 text-slate-400">ملحوظة وشروط التسليم</label>
                <textarea value={newAsset.notes} onChange={e => setNewAsset({...newAsset, notes: e.target.value})} rows={2} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-right" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2 rounded">إصدار وتوقيع</button>
              <button type="button" onClick={() => setShowAssetModal(false)} className="bg-slate-805 bg-slate-805/90 text-slate-450 hover:bg-slate-800 text-slate-400 text-xs px-4 py-2 rounded font-sans">إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
