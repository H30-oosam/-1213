import React, { useState } from "react";
import { User, Candidate } from "../types";
import { syncERPCollection } from "../utils";
import { FileUp, Plus, UserPlus, Search, Star, HelpCircle, Mail, Phone, CalendarRange, Briefcase, Bot, Sparkles, Award } from "lucide-react";

interface JobPost {
  id: string;
  title: string;
  department: "marketing" | "academy" | "hr" | "finance" | "tech";
  requirements: string;
  status: "active" | "closed";
}

interface ATSModuleProps {
  currentUser: User;
  candidates: Candidate[];
  onDataChanged: () => void;
}

export default function ATSModule({
  currentUser,
  candidates,
  onDataChanged
}: ATSModuleProps) {
  const [activeTab, setActiveTab] = useState<"jobs" | "candidates">("candidates");
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  
  // Job Posts list list
  const [jobs, setJobs] = useState<JobPost[]>([
    { id: "job-1", title: "مصمم جرافيك وصانع هوية بصرية (سوشيال ميديا)", department: "marketing", requirements: "خبرة لا تقل عن سنتين في وكالات الدعاية والإعلان، إجادة الفوتوشوب والإليستريتور وتفهم الهويات البصرية العقارية.", status: "active" },
    { id: "job-2", title: "مدرب ومحاضر معتمد لدورة المونتاج وصناعة المحتوى", department: "academy", requirements: "خبرة في المونتاج التفاعلي لوسائل التواصل وتدريس الطلاب وإدارة امتحانات QR.", status: "active" }
  ]);

  // New candidate fields for manually adding / CV parsing
  const [candidateName, setCandidateName] = useState<string>("");
  const [candidateEmail, setCandidateEmail] = useState<string>("");
  const [candidatePhone, setCandidatePhone] = useState<string>("");
  const [candidatePosition, setCandidatePosition] = useState<string>("مصمم جرافيك وصانع هوية بصرية (سوشيال ميديا)");
  const [candidateNotes, setCandidateNotes] = useState<string>("");
  const [testScore, setTestScore] = useState<number>(85);

  const [aiOfferExplanation, setAiOfferExplanation] = useState<string>("");
  const [isGeneratingOffer, setIsGeneratingOffer] = useState<boolean>(false);

  // New job post state
  const [newJob, setNewJob] = useState({
    title: "",
    department: "marketing" as const,
    requirements: ""
  });

  // CV parsing simulation triggers
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const handleDragOverCV = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropCV = (e: React.DragEvent) => {
    e.preventDefault();
    simulateCVParsing();
  };

  const simulateCVParsing = () => {
    setIsParsing(true);
    setTimeout(() => {
      // Mock-parsed CV matching our candidate positioning
      setCandidateName("حسن هلالي عبد الرحمن");
      setCandidateEmail("hassan.helali@gmail.com");
      setCandidatePhone("+201015674322");
      setCandidateNotes("مستخرج ومفهرس بالذكاء الاصطناعي: خبرة 4 سنوات في تصميم جرافيكس العقارات، مهارات ممتازة بالبورتفوليو لبرنامج Behance.");
      setIsParsing(false);
    }, 1500);
  };

  const handleAddNewCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !candidateEmail) return;

    const payload: Candidate = {
      id: `can-${Date.now()}`,
      name: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      position: candidatePosition,
      status: "applied",
      cvUrl: "#",
      testScore: testScore,
      interviewNotes: candidateNotes
    };

    const updated = [payload, ...candidates];
    
    // Sync candidate list
    const success = await syncERPCollection("candidates", updated, currentUser.id, currentUser.name, `تسجيل ملف مرشح جديد التوظيف باسم "${candidateName}" بقائمة الـ ATS.`);
    if (success) {
      setCandidateName("");
      setCandidateEmail("");
      setCandidatePhone("");
      setCandidateNotes("");
      onDataChanged();
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.requirements) return;

    const updated = [
      ...jobs,
      {
        ...newJob,
        id: `job-${Date.now()}`,
        status: "active" as const
      }
    ];

    setJobs(updated);
    setShowJobModal(false);
    setNewJob({ title: "", department: "marketing", requirements: "" });

    // Save logs
    await syncERPCollection("atsJobs", updated, currentUser.id, currentUser.name, `إطلاق ونشر إعلان وظيفة جديدة: "${newJob.title}" بلوحة التوظيف.`);
    onDataChanged();
  };

  const handleGenerateJobOffer = async (cand: Candidate) => {
    setIsGeneratingOffer(true);
    setAiOfferExplanation("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `اكتب خطاب عرض عمل رسمي (Job Offer Description) فاخر باللغة العربية باسم "مؤسسة حسام الورداني للتسويق الرقمي والأكاديمية" للمرشح الموهوب: "${cand.name}" لشغل وظيفة: "${cand.position}". حدد راتباً أساسياً 10,000 ج.م مع مكافآت أداء وحوافز حملات وعقد مدته سنة قابل للتجديد ومصمم على شكل رسالة ترحيبية مهنية راقية.`,
          userRole: currentUser.role,
          userName: currentUser.name
        })
      });
      const data = await response.json();
      if (data.response) {
         setAiOfferExplanation(data.response);
      }
    } catch (e) {
      setAiOfferExplanation(`خطاب عرض العمل للمرشح النخبوي ${cand.name}:\nيسعدنا في شركة الورداني تقديم عرض التوظيف الأساسي بقيمة 10,000 ج.م شامل المزايا الطبية والتأمينات الاجتماعية.`);
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  return (
    <div className="space-y-6 text-right" id="ats-recruitment-suite">
      
      {/* Tab switch navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "candidates" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>إدارة المرشحين والمقابلات ({candidates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "jobs" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>إعلانات الوظائف والفرص ({jobs.length})</span>
        </button>
      </div>

      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4.5">
            <p className="text-xs text-slate-450 text-slate-400 font-sans">تراقب هذه الشاشة الإعلانات المفتوحة المنشورة على صفحة الكارير لجذب المسوقين والمدربين.</p>
            <button
              onClick={() => setShowJobModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs px-3 py-2 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إطلاق إعلان وظيفة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {jobs.map(job => (
              <div key={job.id} className="bg-slate-900 border border-slate-801 border-slate-800 p-5 rounded-2xl shadow-md space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 text-[9px] rounded uppercase font-bold tracking-wider">
                    {job.status === "active" ? "نشط ومفتوح" : "مغلق"}
                  </span>
                  <span className="text-indigo-450 text-indigo-400 font-bold uppercase font-mono text-[9px] bg-indigo-500/10 px-1.5 rounded">{job.department}</span>
                </div>

                <h4 className="text-slate-100 font-bold text-sm leading-relaxed">{job.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed select-text">{job.requirements}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="space-y-6">
          
          {/* Double column work: add applicant (with CSV parsing drag zones) & display current */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-right font-sans text-xs">
            
            {/* CV Drag area & manual form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-905 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 border-b border-slate-800 pb-2">صندوق استقطاب السير الذاتية الذكي (CV Parser)</h4>
              
              {/* Drag zone */}
              <div
                onDragOver={handleDragOverCV}
                onDrop={handleDropCV}
                onClick={simulateCVParsing}
                className="border-2 border-dashed border-slate-801 border-slate-800 hover:border-indigo-500/40 bg-slate-950 p-6 rounded-lg text-center text-slate-450 text-xs cursor-pointer select-none space-y-2.5 transition"
              >
                <FileUp className="w-8 h-8 text-indigo-400/80 mx-auto animate-pulse" />
                <div>
                  <div className="font-bold text-slate-200">اسحب والطف ملف السيرة الذاتية (CV) هنا</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">أو اضغط للمحاكاة الفورية لاستخلاص البيانات بالذكاء الاصطناعي</p>
                </div>
                {isParsing && (
                  <div className="text-[10px] text-yellow-400 animate-pulse font-mono flex items-center justify-center gap-1.5 pt-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري القراءة المبرمجة واستخلاص الجداول...</span>
                  </div>
                )}
              </div>

              {/* Add form */}
              <form onSubmit={handleAddNewCandidate} className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم المرشح بالكامل</label>
                  <input required type="text" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="الاسم المستخلص تلقائياً..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <label className="block text-slate-400 mb-1">البريد الإلكتروني</label>
                    <input required type="email" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} placeholder="contact@example.com" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-left text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">رقم الهاتف الجوال</label>
                    <input required type="text" value={candidatePhone} onChange={e => setCandidatePhone(e.target.value)} placeholder="+201..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-left text-slate-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">الوظيفة المتقدم لها</label>
                  <select value={candidatePosition} onChange={e => setCandidatePosition(e.target.value)} className="w-full bg-slate-950 border border-slate-805 p-2 rounded">
                    {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">درجة الاختبار المبدئي (Test Score / 100)</label>
                  <input type="number" value={testScore} onChange={e => setTestScore(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-right" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">ملاحظات ومهارات المقابلة الأولية</label>
                  <textarea value={candidateNotes} onChange={e => setCandidateNotes(e.target.value)} rows={3} placeholder="اكتب لقطات أو مهارات اللغات والمشاريع..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-right text-slate-200 font-sans" />
                </div>

                <button type="submit" className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded flex items-center justify-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد تسجيل المرشح بالملف</span>
                </button>
              </form>

            </div>

            {/* Candidate database list (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-200 pb-1.5 border-b border-slate-800">قاعدة بيانات المتقدمين وسجل مخرجات المقابلة</h4>

              {aiOfferExplanation && (
                <div className="bg-indigo-950/20 border-2 border-indigo-500/20 p-4.5 rounded-lg leading-relaxed text-slate-300 font-sans mb-3 text-right">
                  <div className="flex items-center gap-1 justify-end font-bold text-indigo-400 mb-2">
                    <Award className="w-4 h-4 text-yellow-300 animate-bounce" />
                    <span>خطاب عرض عمل الذكاء الاصطناعي (Ready Offer Draft):</span>
                  </div>
                  <pre className="text-[10px] whitespace-pre-wrap leading-relaxed select-all">
                    {aiOfferExplanation}
                  </pre>
                </div>
              )}

              <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                {candidates.map(cand => (
                  <div key={cand.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3 hover:border-indigo-500/20 transition">
                    
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateJobOffer(cand)}
                          disabled={isGeneratingOffer}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-1.5 rounded text-[10px] font-bold text-indigo-400"
                        >
                          صياغة وتوليد عقد عرض العمل بـ AI
                        </button>
                      </div>
                      <div className="text-right">
                        <h5 className="font-bold text-slate-100 text-xs">{cand.name}</h5>
                        <p className="text-[10px] text-indigo-400 font-medium mt-0.5">{cand.position}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded">
                      <div className="flex items-center gap-1 justify-end font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-550 text-slate-500" />
                        <span>{cand.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-550 text-slate-500" />
                        <span>{cand.email}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>تقييم الاختبار: {cand.testScore}/100</span>
                      </div>
                      <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                        {cand.status === "applied" ? "متقدم جديد" : "في مرحلة المقابلات"}
                      </span>
                    </div>

                    {cand.interviewNotes && (
                      <p className="text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed italic">
                        {cand.interviewNotes}
                      </p>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Manual Job Creator Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddJob} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-105 border-b border-slate-800 pb-2 flex items-center justify-end gap-1.5 font-sans">
              <span>إطلاق ونشر فرصة عمل جديدة في التوظيف</span>
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </h3>

            <div className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">اسم المسمى الوظيفي</label>
                <input required type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="مشرف فريق الاستهداف وصناع الفيديو..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">القسم المعني بالقضية</label>
                <select value={newJob.department} onChange={e => setNewJob({...newJob, department: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded p-2">
                  <option value="marketing">فريق شركة التسويق الرقمي</option>
                  <option value="academy">هيئة كوتشي ومحاضري الأكاديمية</option>
                  <option value="hr">الموارد البشرية واللوائح</option>
                  <option value="finance">الحسابات والدفاتر</option>
                  <option value="tech">البرمجيات وقواعد البيانات</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-401 text-slate-400 mb-1">الشروط، الخبرات، والمهارات الفنية</label>
                <textarea required value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} rows={5} placeholder="اكتب المتطلبات الوظيفية بوضوح تام للفريق..." className="w-full bg-slate-950 border border-slate-804 rounded p-2 text-right text-slate-200" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold px-4 py-2 rounded">أنشئ وانشر الآن</button>
              <button type="button" onClick={() => setShowJobModal(false)} className="bg-slate-800 hover:bg-slate-705 text-slate-400 text-xs px-4 py-2 rounded font-sans">إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
