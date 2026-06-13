import React, { useState } from "react";
import { User, AccountLedger } from "../types";
import { syncERPCollection } from "../utils";
import { Wallet, Plus, Calculator, FileSpreadsheet, Printer, BadgeCheck, ShieldAlert, BadgeCent, Percent, DollarSign, Award } from "lucide-react";

interface EmployeeSalary {
  id: string;
  userId: string;
  basic: number;
  allowance: number;
  incentives: number;
  commissions: number;
  deductions: number;
  delays: number;
  advances: number;
  bonuses: number;
  tax: number;
  insurance: number;
  month: string;
  status: "pending" | "paid";
}

interface PayrollModuleProps {
  currentUser: User;
  users: User[];
  transactions: AccountLedger[];
  onDataChanged: () => void;
}

export default function PayrollModule({
  currentUser,
  users,
  transactions,
  onDataChanged
}: PayrollModuleProps) {
  // Filter core staff we pay salary to
  const staff = users.filter(u => u.role !== "client" && u.role !== "student");

  // Local payroll memory cache/database simulation backed by sync
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([
    { id: "sal-1", userId: "u-3", basic: 12000, allowance: 1500, incentives: 1000, commissions: 0, deductions: 0, delays: 0, advances: 0, bonuses: 500, tax: 1500, insurance: 800, month: "2026-06", status: "paid" },
    { id: "sal-2", userId: "u-8", basic: 8000, allowance: 1000, incentives: 500, commissions: 400, deductions: 200, delays: 50, advances: 500, bonuses: 0, tax: 800, insurance: 500, month: "2026-06", status: "paid" },
  ]);

  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedSalary, setSelectedSalary] = useState<EmployeeSalary | null>(null);
  const [activeTab, setActiveTab] = useState<"directory" | "statement">("directory");

  // New salary calculation states
  const [basic, setBasic] = useState<number>(10000);
  const [allowance, setAllowance] = useState<number>(1500);
  const [incentives, setIncentives] = useState<number>(500);
  const [commissions, setCommissions] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [delays, setDelays] = useState<number>(0);
  const [advances, setAdvances] = useState<number>(0);
  const [bonuses, setBonuses] = useState<number>(0);
  const [tax, setTax] = useState<number>(1000);
  const [insurance, setInsurance] = useState<number>(600);
  const [currentMonth, setCurrentMonth] = useState<string>("2026-06");

  const [slipPreview, setSlipPreview] = useState<EmployeeSalary | null>(null);

  // Math equations
  const grossPay = basic + allowance + incentives + commissions + bonuses;
  const totalDeductions = deductions + delays + advances + tax + insurance;
  const netSalary = grossPay - totalDeductions;

  const handleEditSalary = (empId: string) => {
    const existing = salaries.find(s => s.userId === empId && s.month === currentMonth);
    setSelectedStaffId(empId);
    
    if (existing) {
      setBasic(existing.basic);
      setAllowance(existing.allowance);
      setIncentives(existing.incentives);
      setCommissions(existing.commissions);
      setDeductions(existing.deductions);
      setDelays(existing.delays);
      setAdvances(existing.advances);
      setBonuses(existing.bonuses);
      setTax(existing.tax);
      setInsurance(existing.insurance);
      setSelectedSalary(existing);
    } else {
      // Set defaults for fresh calculation
      setBasic(empId === "u-1" ? 30000 : empId === "u-2" ? 15000 : empId === "u-5" ? 12000 : 8000);
      setAllowance(1500);
      setIncentives(500);
      setCommissions(0);
      setDeductions(0);
      setDelays(0);
      setAdvances(0);
      setBonuses(0);
      setTax(1000);
      setInsurance(600);
      setSelectedSalary(null);
    }
    setActiveTab("statement");
  };

  const saveSalaryStatement = async () => {
    const staffMember = users.find(u => u.id === selectedStaffId);
    if (!staffMember) return;

    const payload: EmployeeSalary = {
      id: selectedSalary?.id || `sal-${Date.now()}`,
      userId: selectedStaffId,
      basic,
      allowance,
      incentives,
      commissions,
      deductions,
      delays,
      advances,
      bonuses,
      tax,
      insurance,
      month: currentMonth,
      status: "paid"
    };

    const isExisting = salaries.some(s => s.id === payload.id);
    const updatedSalaries = isExisting
      ? salaries.map(s => s.id === payload.id ? payload : s)
      : [...salaries, payload];

    setSalaries(updatedSalaries);

    // Save to server audit logging and create general transaction expense in finance ledger
    const journalEntry: AccountLedger = {
      id: `tx-sal-${Date.now()}`,
      type: "expense",
      category: "salary",
      amount: netSalary,
      account: "bank_cib",
      date: new Date().toISOString().split("T")[0],
      description: `صرف مسيرات راتب شهر ${currentMonth} للموظف: ${staffMember.name}`,
      invoiceNo: `SAL-${currentMonth}-${staffMember.id.substring(0, 4)}`,
      taxAmount: tax
    };

    const syncedTx = [journalEntry, ...transactions];
    const success = await syncERPCollection("transactions", syncedTx, currentUser.id, currentUser.name, `مسيرات كشوف الرواتب لشهر ${currentMonth} للموظف ${staffMember.name} وإيداع صافي {${netSalary}} ج.م بنجاح.`);
    
    if (success) {
      setSlipPreview(payload);
      onDataChanged();
    }
  };

  const triggerDirectPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-right" id="payroll-system-pro">
      
      {/* Tab controls */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "directory" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>كشوف الرصيد والمسيرات السنوية</span>
        </button>
        {selectedStaffId && (
          <button
            onClick={() => setActiveTab("statement")}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
              activeTab === "statement" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>احتساب دقيق: {users.find(u => u.id === selectedStaffId)?.name}</span>
          </button>
        )}
      </div>

      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 font-sans">جدولة وإعداد مسيرات دفع رواتب الموظفين البنكية</h3>
              <p className="text-xs text-slate-400 font-sans">
                يتيح هذا القسم ربط الدوام بالحوافز والعمولات والاستقطاعات التلقائية متضمناً الضرائب بنسبة 14% والتأمينات الإلزامية لصناعة الفواتير.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500">شهر مسيرات الاحتساب:</span>
              <input
                type="month"
                value={currentMonth}
                onChange={e => setCurrentMonth(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 p-1.5 rounded"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">صورة</th>
                    <th className="p-3">اسم الموظف</th>
                    <th className="p-3">المنصب الإداري</th>
                    <th className="p-3">الراتب الأساسي التقديري</th>
                    <th className="p-3">حالة إعداد مسودة الدفع</th>
                    <th className="p-3 text-center">العمليات والمساندة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {staff.map(emp => {
                    const salMatched = salaries.find(s => s.userId === emp.id && s.month === currentMonth);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-950/40">
                        <td className="p-3">
                          <img src={emp.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-800" />
                        </td>
                        <td className="p-3 font-bold text-slate-100">{emp.name}</td>
                        <td className="p-3"><span className="bg-slate-950 px-2 py-0.5 rounded text-indigo-400 border border-slate-850">{emp.role}</span></td>
                        <td className="p-3 font-mono font-bold text-slate-200">
                          {salMatched ? `${salMatched.basic.toLocaleString()}` : "جدولة الراتب"} ج.م
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${salMatched ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500"}`}>
                            {salMatched ? "مجهز ومصروف" : "بانتظار المرجعية"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleEditSalary(emp.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-[11px] px-2.5 py-1 rounded"
                          >
                            احسب الراتب ومسيرات الدفع
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "statement" && selectedStaffId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Advanced Calculations Input Panel (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-indigo-400 border-b border-slate-800 pb-2">تفاصيل وعوامل الأجر للموظف: {users.find(u => u.id === selectedStaffId)?.name}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              
              {/* Gross elements Block */}
              <div className="space-y-4 border border-slate-800/80 p-3.5 rounded-lg bg-slate-950/40">
                <div className="text-emerald-400 font-bold border-b border-slate-850 pb-1 flex items-center gap-1">
                  <BadgeCent className="w-4 h-4" />
                  <span>المستحقات والإضافات (+)</span>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الراتب الأساسي (Basic Salary)</label>
                  <input type="number" value={basic} onChange={e => setBasic(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">البدلات (Allowances)</label>
                  <input type="number" value={allowance} onChange={e => setAllowance(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الحوافز (Incentives)</label>
                  <input type="number" value={incentives} onChange={e => setIncentives(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">العمولات والمبيعات (Commissions)</label>
                  <input type="number" value={commissions} onChange={e => setCommissions(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المكافآت والتميز (Bonuses)</label>
                  <input type="number" value={bonuses} onChange={e => setBonuses(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
              </div>

              {/* Deductions elements Block */}
              <div className="space-y-4 border border-slate-800/80 p-3.5 rounded-lg bg-slate-950/40">
                <div className="text-rose-450 font-bold border-b border-slate-850 pb-1 flex items-center gap-1 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>الخصومات والاستحقاعات (-)</span>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الخصومات والغيابات (Deductions)</label>
                  <input type="number" value={deductions} onChange={e => setDeductions(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">جزاء التأخير (Delay Penalties)</label>
                  <input type="number" value={delays} onChange={e => setDelays(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">السُّلف العاجلة والقروض (Advances)</label>
                  <input type="number" value={advances} onChange={e => setAdvances(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">كسب العمل والضريبة (Payroll Tax)</label>
                  <input type="number" value={tax} onChange={e => setTax(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">التأمينات الاجتماعية (Social Insurance)</label>
                  <input type="number" value={insurance} onChange={e => setInsurance(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
              </div>

            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
              <div className="text-right">
                <div className="text-slate-400">صافي المبلّغ المصروف والمصادق:</div>
                <div className="text-xl font-mono text-emerald-400 font-extrabold">{netSalary.toLocaleString()} EGP</div>
              </div>
              <button
                onClick={saveSalaryStatement}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-extrabold px-5 py-2 rounded-lg"
              >
                حفظ وإصدار كشف الراتب السنوي
              </button>
            </div>
          </div>

          {/* Golden corporate Payslip (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {slipPreview ? (
              <div className="bg-white border-2 border-slate-100 rounded-xl p-5 shadow-xl text-slate-800 space-y-4" id="salary-payslip-canvas">
                
                {/* Print design slip header */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-3">
                  <div className="text-left">
                    <div className="text-[12px] font-bold text-slate-900">كشف راتب موثق</div>
                    <div className="text-[9px] text-slate-400 font-mono">CODE: PAY-{slipPreview.month}-{slipPreview.userId.substring(0, 4)}</div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[11px] font-extrabold text-slate-900">مؤسسة حسام الورداني للتسويق الرقمي</h4>
                    <p className="text-[8px] text-indigo-600 font-bold">الحسابات العامة والدفاتر وميزان التدقيق</p>
                  </div>
                </div>

                {/* Staff metadata info */}
                <div className="grid grid-cols-2 gap-2 text-[9px] border border-slate-100 bg-slate-50 p-2.5 rounded font-sans">
                  <div>
                    <span className="text-slate-400">فترة الاستحقاق:</span>
                    <span className="font-bold text-slate-800 font-mono block">{slipPreview.month}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">اسم المستحق:</span>
                    <span className="font-bold text-slate-800 block">{users.find(u => u.id === slipPreview.userId)?.name}</span>
                  </div>
                </div>

                {/* Earnings vs Deductions Table */}
                <div className="grid grid-cols-2 gap-4 text-[9px] font-sans">
                  
                  {/* Earnings */}
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-600 border-b pb-0.5 mb-1 text-right">الموجبات والمستحقات (+)</div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.basic.toLocaleString()} EGP</span><span className="text-slate-400">الراتب الأساسي</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.allowance.toLocaleString()} EGP</span><span className="text-slate-400">البدلات المعززة</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.incentives.toLocaleString()} EGP</span><span className="text-slate-400">الحوافز الإنتاجية</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.commissions.toLocaleString()} EGP</span><span className="text-slate-400">العمولات والمبيعات</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.bonuses.toLocaleString()} EGP</span><span className="text-slate-400">المكافآت والتميز</span></div>
                    <div className="border-t pt-1 flex justify-between font-bold text-slate-900 font-mono mt-1">
                      <span>{grossPay.toLocaleString()} EGP</span>
                      <span>إجمالي المستحق</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-1">
                    <div className="font-bold text-rose-600 border-b pb-0.5 mb-1 text-right">الاستقطاعات والضرائب (-)</div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.deductions.toLocaleString()} EGP</span><span className="text-slate-400">الغيابات والخصوم</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.delays.toLocaleString()} EGP</span><span className="text-slate-400">جزاء التأخير</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.advances.toLocaleString()} EGP</span><span className="text-slate-400">سلفيات وقروض</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.tax.toLocaleString()} EGP</span><span className="text-slate-400">الضريبة الموصى</span></div>
                    <div className="flex justify-between font-mono"><span>{slipPreview.insurance.toLocaleString()} EGP</span><span className="text-slate-400">التأمينات الاجتماعية</span></div>
                    <div className="border-t pt-1 flex justify-between font-bold text-slate-900 font-mono mt-1">
                      <span>{totalDeductions.toLocaleString()} EGP</span>
                      <span>إجمالي المستقطع</span>
                    </div>
                  </div>

                </div>

                {/* Total Net Pay area */}
                <div className="bg-slate-950 p-3 rounded-lg flex justify-between items-center text-white border border-slate-900 mt-2 font-sans">
                  <div className="text-left font-mono font-bold text-[13px]">
                    {netSalary.toLocaleString()} EGP
                  </div>
                  <div className="text-right">
                    <div className="text-[7px] text-slate-400 uppercase">Total Net Salary Paid</div>
                    <div className="text-[10px] font-bold text-slate-100">صافي المبلّغ المستحق والبنكي</div>
                  </div>
                </div>

                {/* Footstamp security */}
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-100">
                  <div className="w-10 h-10 border border-slate-200 flex items-center justify-center rounded">
                    <span className="text-[7px] font-mono font-bold text-indigo-500 uppercase text-center leading-none">VERIFIED<br/>QR CODE</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-bold text-slate-950 flex items-center gap-1 justify-end">
                      <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>معتمد من المدير والشريك المالي</span>
                    </div>
                    <p className="text-[7px] text-slate-400 mt-0.5">م. حسام الورداني (CEO CIB Verified)</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={triggerDirectPrint}
                    className="flex-1 bg-slate-900 text-white font-sans text-[10px] py-1.5 rounded flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    <span>طباعة القسيمة</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-xs py-14 space-y-1.5 font-sans">
                <Wallet className="w-10 h-10 text-indigo-400/50 mx-auto animate-pulse" />
                <p>لم يتم إصدار كشف دائم بعد.</p>
                <p className="text-[10px] text-slate-500">اختر موظفاً واضبط مدخلاته لاحتساب وإصدار قسائم الراتب التلقائية والتحقق البنكي.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
