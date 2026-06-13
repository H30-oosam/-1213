import React, { useState } from "react";
import { AccountLedger, ClientCorp, User } from "../types";
import { syncERPCollection } from "../utils";
import { DollarSign, Percent, TrendingUp, TrendingDown, Plus, CreditCard, Search, FileSpreadsheet, Layers, Printer, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface FinanceModuleProps {
  currentUser: User;
  transactions: AccountLedger[];
  clients: ClientCorp[];
  onDataChanged: () => void;
}

export default function FinanceModule({
  currentUser,
  transactions,
  clients,
  onDataChanged
}: FinanceModuleProps) {
  const [activeTab, setActiveTab] = useState<"ledger" | "accounts" | "invoices">("ledger");

  // New transaction state
  const [showTxModal, setShowTxModal] = useState(false);
  const [newTx, setNewTx] = useState({
    type: "revenue" as const,
    category: "course_sell" as const,
    amount: 0,
    account: "safe" as const,
    description: "",
    invoiceNo: ""
  });

  // Invoice generator state
  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [invoiceCategory, setInvoiceCategory] = useState<any>("subscription");
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;

    // Calculate simulated 14% tax on revenues
    const taxValue = newTx.type === "revenue" ? Math.round(newTx.amount * 0.14) : 0;

    const updated = [
      ...transactions,
      {
        ...newTx,
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        invoiceNo: newTx.invoiceNo || `INV-${Math.floor(Math.random() * 8999) + 1000}`,
        taxAmount: taxValue
      }
    ];

    const success = await syncERPCollection("transactions", updated, currentUser.id, currentUser.name, `توثيق قيد مالي بقيمة ${newTx.amount} ج.م في الخزينة.`);
    if (success) {
      setShowTxModal(false);
      setNewTx({ type: "revenue", category: "course_sell", amount: 0, account: "safe", description: "", invoiceNo: "" });
      onDataChanged();
    }
  };

  const handleGenerateInvoice = () => {
    if (!invoiceClient || !invoiceAmount) return;
    const clientObj = clients.find(c => c.id === invoiceClient);
    const tax = Math.round(invoiceAmount * 0.14);
    const total = invoiceAmount + tax;
    
    setGeneratedInvoice({
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      clientName: clientObj ? clientObj.name : "عميل عابر",
      clientCompany: clientObj ? clientObj.company : "شركة خارجية",
      clientId: invoiceClient,
      amount: invoiceAmount,
      tax: tax,
      total: total,
      category: invoiceCategory
    });
  };

  // Safe and Bank account calculations
  const totalRevenue = transactions.filter(t => t.type === "revenue").reduce((sum, current) => sum + current.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, current) => sum + current.amount, 0);
  const netProfit = totalRevenue - totalExpense;
  const totalTax = transactions.filter(t => t.type === "revenue").reduce((sum, current) => sum + (current.taxAmount || 0), 0);

  const safeBalance = transactions.filter(t => t.account === "safe").reduce((bal, t) => t.type === "revenue" ? bal + t.amount : bal - t.amount, 0);
  const bankAhliBalance = transactions.filter(t => t.account === "bank_ahli").reduce((bal, t) => t.type === "revenue" ? bal + t.amount : bal - t.amount, 0);
  const cibBalance = transactions.filter(t => t.account === "bank_cib").reduce((bal, t) => t.type === "revenue" ? bal + t.amount : bal - t.amount, 0);

  // Group transactions for Recharts
  const chartData = transactions.slice(-10).reverse().map(t => ({
    name: t.date,
    amount: t.type === "revenue" ? t.amount : -t.amount,
  }));

  return (
    <div className="space-y-6" id="finance-module-main">
      
      {/* Visual KPI indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenues card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-sans">إجمالي الإيرادات المسجلة</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{totalRevenue.toLocaleString()} EGP</div>
            <div className="text-[9px] text-emerald-400 mt-1">تحديث سحابي مباشر</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expenses card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-sans">إجمالي المصاريف والرواتب</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{totalExpense.toLocaleString()} EGP</div>
            <div className="text-[9px] text-rose-400 mt-1">شاملة تمويل الحملات</div>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-lg">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Net Profit card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-sans">صافي الربح المكتسب</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{netProfit.toLocaleString()} EGP</div>
            <div className="text-[9px] text-indigo-400 mt-1">قبل خصم الرسوم الضريبية</div>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Taxes card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-sans">ضرائب قيمة مضافة مستقطعة (14%)</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{totalTax.toLocaleString()} EGP</div>
            <div className="text-[9px] text-amber-500 mt-1">محسوبة ومحجوزة مؤقتاً</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <Percent className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Sub tabs controls */}
      <div className="flex border-b border-slate-800 gap-1.5 scroll-x-auto">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "ledger" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>القيود المالية ودفتر اليومية</span>
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "accounts" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>خزائن الشركة والحسابات البنكية</span>
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "invoices" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>فواتير العملاء ونقاط الدفع</span>
        </button>
      </div>

      {/* Tab 1: Ledger & Simple Chart */}
      {activeTab === "ledger" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-bold text-slate-100 font-sans">دفتر المعاملات والحسابات الجارية</h3>
              <button
                onClick={() => setShowTxModal(true)}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل قيد مالي</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-850">
                    <th className="pb-2">البند / الوصف</th>
                    <th className="pb-2">رقم الفاتورة</th>
                    <th className="pb-2 font-mono">طريقة الحساب</th>
                    <th className="pb-2">القيمة</th>
                    <th className="pb-2">تاريخ القيد</th>
                    <th className="pb-2 text-left">مجموع ضريبة 14%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-200">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-2.5 font-sans font-medium">{tx.description}</td>
                      <td className="py-2.5 font-mono text-slate-400">{tx.invoiceNo || "--"}</td>
                      <td className="py-2.5 font-sans uppercase font-bold text-[10px] text-slate-400">
                        {tx.account === "safe" ? "خزينة كاش" : tx.account === "bank_ahli" ? "الأهلي المصري" : "بنك CIB"}
                      </td>
                      <td className={`py-2.5 font-mono font-bold ${tx.type === "revenue" ? "text-emerald-400" : "text-rose-400"}`}>
                        {tx.type === "revenue" ? "+" : "-"}{tx.amount.toLocaleString()} EGP
                      </td>
                      <td className="py-2.5 font-mono text-slate-400">{tx.date}</td>
                      <td className="py-2.5 font-mono text-amber-500 text-left font-bold">{tx.taxAmount ? `${tx.taxAmount.toLocaleString()}` : "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-100 font-sans border-b border-slate-800 pb-3 mb-4">مخطط التدفقات النقدية والأداء المالي</h3>
            <div className="w-full h-48 bg-slate-950 rounded-lg p-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} labelStyle={{ color: "#f8fafc" }} />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={0.15} fill="#6366f1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed text-right mt-3">
              يوضح الرسم البياني الفوارق القياسية في الإيداع والصرف في آخر 10 معاملات جرت في خزائن الشركة.
            </p>
          </div>

        </div>
      )}

      {/* Tab 2: Safe accounts balances breakdown */}
      {activeTab === "accounts" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200">الخزينة النقدية الرئيسية (الكاش)</h3>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">{safeBalance.toLocaleString()} EGP</div>
            <p className="text-[10px] text-slate-500">مخصصة لدفع الجزئيات، الرواتب الصغيرة، والمصاريف الإدارية اليومية.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200">البنك الأهلي المصري</h3>
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">{bankAhliBalance.toLocaleString()} EGP</div>
            <p className="text-[10px] text-slate-500">الحساب الرئيسي لتحصيل رسوم الطلاب والخدمات الاستشارية والمحاضرات.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200">بنك CIB التجاري</h3>
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">{cibBalance.toLocaleString()} EGP</div>
            <p className="text-[10px] text-slate-500">حساب الوكالة المعتمد لتمويل الحملات الممولة والشراكات الكبرى.</p>
          </div>

        </div>
      )}

      {/* Tab 3: Detailed Client Invoice Generator */}
      {activeTab === "invoices" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100">موديل إصدار الفاتورة الضريبية للعميل</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر العميل</label>
                <select value={invoiceClient} onChange={e => setInvoiceClient(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-indigo-500">
                  <option value="">-- اختر العميل --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">قيمة الخدمة الأساسية (EGP)</label>
                <input type="number" value={invoiceAmount || ""} onChange={e => setInvoiceAmount(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">تصنيف البند المالي</label>
                <select value={invoiceCategory} onChange={e => setInvoiceCategory(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 p-2 text-slate-100 rounded">
                  <option value="subscription">اشتراك عقد إدارة</option>
                  <option value="marketing_run">إدارة إعلانات ممولة وميزانية</option>
                  <option value="course_sell">رسوم كورسات الأكاديمية</option>
                </select>
              </div>

              <button
                onClick={handleGenerateInvoice}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition"
              >
                إنشاء معاينة الفاتورة وحساب ضريبة 14%
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2 mb-4 w-full text-right">معاينة الفاتورة المستخرجة للتصدير والطباعة</h3>

            {generatedInvoice ? (
              <div className="bg-slate-950 p-6 rounded-lg text-right max-w-md w-full border border-slate-850 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-mono font-bold text-[10px]">{generatedInvoice.invoiceNo}</span>
                  <div>
                    <h4 className="font-bold text-slate-100">فاتورة ضريبية رسمية</h4>
                    <p className="text-[10px] text-slate-500 italic">مؤسسة حسام الورداني ERP</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div>مقدمة إلى: <b className="text-slate-200">{generatedInvoice.clientName}</b></div>
                  <div>المنشأة: <b className="text-indigo-400">{generatedInvoice.clientCompany}</b></div>
                  <div className="text-[10px] text-slate-550 font-mono">تاريخ الإصدار: {generatedInvoice.date}</div>
                </div>

                <div className="border-t border-b border-slate-800 py-3 space-y-1.5 leading-relaxed bg-slate-900/40 p-3 rounded">
                  <div className="flex justify-between">
                    <span className="font-mono">{generatedInvoice.amount.toLocaleString()} ج.م</span>
                    <span className="text-slate-400">قيمة الأعمال الأساسية:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-amber-500">+{generatedInvoice.tax.toLocaleString()} ج.م</span>
                    <span className="text-slate-400">ضريبة القيمة المضافة الإلزامية (14%):</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
                    <span className="font-mono text-emerald-400 underline">{generatedInvoice.total.toLocaleString()} EGP</span>
                    <span className="text-slate-250">المجموع المالي الإجمالي:</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button onClick={() => window.print()} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-[10px] px-3 py-1 rounded">
                    <Printer className="w-3 h-3" />
                    <span>طباعة الفاتورة PDF</span>
                  </button>
                  <span className="text-[9px] text-slate-500 italic flex items-center">نظام سحابي خاضع للتشفير والتوثيق</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 text-xs font-sans">
                الرجاء إدخال البيانات بالجانب لفرز الفاتورة الضريبية وحجز القيود.
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: Record Transaction */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddTransaction} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">تسجيل قيد مالي جديد بدفتر اليومية</h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">نوع المعاملة</label>
                <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none">
                  <option value="revenue">إيداع / إيراد (+)</option>
                  <option value="expense">صرف / مصروف (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">تصنيف القيد</label>
                <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none">
                  <option value="salary">رواتب موظفين</option>
                  <option value="marketing_run">ميزانية إعلانات ممولة</option>
                  <option value="course_sell">اشتراك كورس أكاديمية</option>
                  <option value="subscription">قسط تعاقد شهري</option>
                  <option value="other">عمليات أخرى</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">القيمة المالية (جنيهاً مصرياً)</label>
                <input required type="number" value={newTx.amount || ""} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">الحساب المربوط</label>
                <select value={newTx.account} onChange={e => setNewTx({...newTx, account: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none">
                  <option value="safe">خريطة الكاش (الخزنة)</option>
                  <option value="bank_ahli">بنك الأهلي المصري</option>
                  <option value="bank_cib">بنك CIB التجاري</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1">البند / شرح توضيحي للمعاملة</label>
              <input required type="text" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} placeholder="شرح تفصيلي للمصروف أو الإيراد..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">تثبيت القيد المالي</button>
              <button type="button" onClick={() => setShowTxModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
