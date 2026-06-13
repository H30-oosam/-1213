import React, { useState } from "react";
import { Course, Enrollment, User, Quiz, Assignment, Submission } from "../types";
import { syncERPCollection } from "../utils";
import { BookOpen, GraduationCap, Award, CheckCircle, Video, ListChecks, FileInput, Plus, Star, Search, CheckSquare, RefreshCw, PenTool, Link, ExternalLink, ShieldCheck, Printer } from "lucide-react";

interface AcademyModuleProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  quizzes: Quiz[];
  assignments: Assignment[];
  submissions: Submission[];
  users: User[];
  onDataChanged: () => void;
}

export default function AcademyModule({
  currentUser,
  courses,
  enrollments,
  quizzes,
  assignments,
  submissions,
  users,
  onDataChanged
}: AcademyModuleProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "quizzes" | "certificates">("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Verification code scanner state
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [scannedResult, setScannedResult] = useState<any>(null);

  // New Course modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    coachId: "",
    description: "",
    price: 0,
    duration: "4 أسابيع",
    zoomLink: "https://zoom.us/j/hossam-academy-live-id",
    videos: [
      { title: "المحاضرة الأولى: مقدمة في خوارزميات ميتا وتحليل النقرات", duration: "1h 15m", url: "#" },
      { title: "المحاضرة الثانية: هياكل الاستهداف الجيومغناطيسي لفيسبوك", duration: "1h 30m", url: "#" }
    ] as Array<{ title: string; duration: string; url: string }>,
    files: [] as Array<{ name: string; url: string }>
  });

  // Question bank creator
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizChoiceA, setQuizChoiceA] = useState("");
  const [quizChoiceB, setQuizChoiceB] = useState("");
  const [quizAnswer, setQuizAnswer] = useState("A");
  const [mockQuestionBank, setMockQuestionBank] = useState([
    { question: "ما هو أفضل مؤشر لقياس كفاءة المنفق الإعلاني؟", a: "CPL", b: "ROAS", answer: "B" },
    { question: "ما هو معدل الـ CTR المناسب لحملات العقارات في مصر؟", a: "بين 2% إلى 4%", b: "أقل من 0.5%", answer: "A" }
  ]);

  // Certificate Generator State
  const [selectedStudentForCert, setSelectedStudentForCert] = useState("");
  const [selectedCourseForCert, setSelectedCourseForCert] = useState("");
  const [certGrade, setCertGrade] = useState("95");
  const [customCertPreview, setCustomCertPreview] = useState<any>(null);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.coachId) return;

    const updated = [
      ...courses,
      {
        ...newCourse,
        id: `crs-${Date.now()}`,
        averageReview: 5.0,
        zoomLink: newCourse.zoomLink
      }
    ];

    const success = await syncERPCollection("courses", updated, currentUser.id, currentUser.name, `إنشاء دورة تعليمية جديدة بالأكاديمية بعنوان "${newCourse.title}" مع دمج رابط زووم حي.`);
    if (success) {
      setShowCourseModal(false);
      setNewCourse({ title: "", coachId: "", description: "", price: 0, duration: "4 أسابيع", zoomLink: "https://zoom.us/j/hossam-academy-live-id", videos: [], files: [] });
      onDataChanged();
    }
  };

  const handleAddQuestionToBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestion) return;
    setMockQuestionBank([...mockQuestionBank, { question: quizQuestion, a: quizChoiceA, b: quizChoiceB, answer: quizAnswer }]);
    setQuizQuestion("");
    setQuizChoiceA("");
    setQuizChoiceB("");
  };

  const handleGenerateCustomCertificate = () => {
    const student = users.find(u => u.id === selectedStudentForCert);
    const course = courses.find(c => c.id === selectedCourseForCert);
    
    if (!student || !course) return;

    setCustomCertPreview({
      studentName: student.name,
      courseTitle: course.title,
      grade: certGrade,
      certificateId: `HE-CERT-${Date.now().toString().substring(6)}`,
      date: new Date().toISOString().split("T")[0]
    });
  };

  const handleVerifyCertificate = () => {
    if (!verificationCodeInput.trim()) return;
    
    // Check local previews or default mocks
    if (customCertPreview && customCertPreview.certificateId.toLowerCase() === verificationCodeInput.toLowerCase().trim()) {
      setScannedResult({
        isValid: true,
        studentName: customCertPreview.studentName,
        courseTitle: customCertPreview.courseTitle,
        grade: customCertPreview.grade,
        id: customCertPreview.certificateId
      });
      return;
    }

    const found = enrollments.find(e => e.certificateId?.toLowerCase() === verificationCodeInput.toLowerCase().trim());
    if (found) {
      const student = users.find(u => u.id === found.studentId);
      const course = courses.find(c => c.id === found.courseId);
      setScannedResult({
        isValid: true,
        studentName: student ? student.name : "طالب غير معروف",
        courseTitle: course ? course.title : "دورة تعليمية غير معروفة",
        grade: found.grade || 100,
        id: found.certificateId
      });
    } else {
      setScannedResult({
        isValid: false,
        message: "عذراً، كود التحقق المدخل غير مسجل بسجلات الأكاديمية المعتمدة."
      });
    }
  };

  const coaches = users.filter(u => u.role === "coach" || u.role === "admin");

  return (
    <div className="space-y-6 text-right" id="academy-module-main">
      
      {/* Upper sub tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "courses" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>المناهج والكورسات ({courses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "quizzes" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>الاختبارات وبنك الأسئلة</span>
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "certificates" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>منظومة الشهادات والتحقق بالـ QR</span>
        </button>
      </div>

      {/* 1. Courses List Tab */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
            <p className="text-xs text-slate-300 font-sans">
              لوحة إدارة وتعديل مناهج الأكاديمية التعليمية وربطها بالمدربين والطلاب والدروس الحية.
            </p>
            {["admin", "academy_manager"].includes(currentUser.role) && (
              <button
                onClick={() => setShowCourseModal(true)}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition font-sans"
              >
                <Plus className="w-4 h-4" />
                <span>إدراج كورس جديد</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] bg-slate-950 font-mono text-indigo-400 px-2 py-0.5 rounded border border-slate-800">
                      {course.duration}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-bold">{course.averageReview || 5.0}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 font-sans mb-1 text-right">{course.title}</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">{course.description}</p>
                </div>

                {/* Meet link alert */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[10px] mb-3 flex items-center justify-between text-indigo-400">
                  <a href={(course as any).zoomLink || "https://zoom.us"} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-indigo-900/30 font-bold px-2 py-1 rounded">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>رابط البث (زووم)</span>
                  </a>
                  <span className="text-slate-400">محاضرة تفاعلية دورية:</span>
                </div>

                <div className="border-t border-slate-850 pt-3 mt-2 flex justify-between items-center text-xs font-sans">
                  <div>
                    <div className="text-[10px] text-slate-500">المدرب المسؤول</div>
                    <div className="font-medium text-slate-300">{users.find(u => u.id === course.coachId)?.name || "مدرب متميز"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">سعر الاشتراك</div>
                    <div className="text-emerald-400 font-bold font-mono">{course.price.toLocaleString()} EGP</div>
                  </div>
                </div>

                {/* Simulated watch link */}
                <div className="mt-4 pt-2.5 border-t border-slate-800/40 flex justify-end">
                  <button
                    onClick={() => setSelectedCourseId(selectedCourseId === course.id ? null : course.id)}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>عرض المحاضرات والمسجلات الحرة ({course.videos ? course.videos.length : 2})</span>
                  </button>
                </div>

                {/* Lectures Drawer */}
                {selectedCourseId === course.id && (
                  <div className="mt-3 bg-slate-950 p-2.5 border border-slate-850 rounded-lg space-y-1.5 transition-all text-xs">
                    <div className="font-bold text-indigo-300 mb-1">الفيديوهات وملفات التعلم المتاحة:</div>
                    {course.videos && course.videos.length > 0 ? (
                      course.videos.map((vid, vi) => (
                        <div key={vi} className="flex justify-between items-center p-1.5 bg-slate-900 text-slate-300 rounded">
                          <span className="font-mono text-[10px] text-slate-500">{vid.duration}</span>
                          <span>{vid.title}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between items-center p-1.5 bg-slate-900 text-slate-300 rounded">
                          <span className="font-mono text-[10px] text-slate-500">1h 15m</span>
                          <span>المحاضرة الأولى: مقدمة في خوارزميات ميتا وتحليل النقرات</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-slate-900 text-slate-300 rounded">
                          <span className="font-mono text-[10px] text-slate-500">1h 30m</span>
                          <span>المحاضرة الثانية: هياكل الاستهداف الجيومغناطيسي لفيسبوك</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Quizzes & Submissions Tab */}
      {activeTab === "quizzes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-sans">
          
          {/* Question Bank Creator (LMS upgrade) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-end gap-1.5 border-b border-slate-800 pb-2.5">
              <span>بنك الأسئلة ومنشئ الاختبارات المدرسية المحدث</span>
              <PenTool className="w-4 h-4 text-indigo-400" />
            </h3>

            <form onSubmit={handleAddQuestionToBank} className="space-y-3.5 bg-slate-950 p-3.5 border border-slate-850 rounded-lg">
              <div>
                <label className="block text-slate-400 mb-1">السؤال المقترح</label>
                <input required type="text" value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)} placeholder="مثال: من هو مدير مشروع الشيفاء للتسويق؟..." className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">الخيار الأول (أ)</label>
                  <input required type="text" value={quizChoiceA} onChange={e => setQuizChoiceA(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الخيار الثاني (ب)</label>
                  <input required type="text" value={quizChoiceB} onChange={e => setQuizChoiceB(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">الإجابة المعتمدة الصحيحة</label>
                <select value={quizAnswer} onChange={e => setQuizAnswer(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5">
                  <option value="A">الخيار الأول (أ)</option>
                  <option value="B">الخيار الثاني (ب)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-505 text-white py-1.5 rounded font-bold">حفظ وإدراج ببنك الاختبارات</button>
            </form>

            <div className="space-y-2">
              <div className="text-slate-400 font-bold">الأسئلة المدرجة حالياً ببنك البيانات:</div>
              {mockQuestionBank.map((q, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 p-2.5 rounded text-[11px] space-y-1">
                  <div className="font-bold text-slate-100 flex justify-between">
                    <span className="text-indigo-400">س {idx+1}</span>
                    <span>{q.question}</span>
                  </div>
                  <div className="flex gap-4 text-slate-400">
                    <span className={q.answer === "A" ? "text-emerald-400 font-bold" : ""}>أ) {q.a}</span>
                    <span className={q.answer === "B" ? "text-emerald-400 font-bold" : ""}>ب) {q.b}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Answers list */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2 border-b border-slate-800 pb-2.5 justify-end">
              <span>نتائج وتقييم كراسات الطلاب والواجبات</span>
              <ListChecks className="w-4 h-4 text-indigo-400" />
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-2">اسم الطالب</th>
                    <th className="pb-2">الواجب العملي</th>
                    <th className="pb-2">الدرجة الممنوحة</th>
                    <th className="pb-2">رأي الكوتش والتقييم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-200">
                  {submissions.map(sub => {
                    const stu = users.find(u => u.id === sub.studentId);
                    return (
                      <tr key={sub.id}>
                        <td className="py-2.5 text-indigo-300 font-sans hover:underline">{stu ? stu.name : "طالب جديد"}</td>
                        <td className="py-2.5 font-bold">{sub.fileName}</td>
                        <td className="py-2.5 font-mono text-emerald-400 font-bold">{sub.grade ? `${sub.grade}/100` : "85/100"}</td>
                        <td className="py-2.5 text-slate-400 italic text-[11px]">{sub.feedback || "أحسنت بالاستهداف وزيادة معدل الـ Click Through!"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Certificate Check by QR Verify Code */}
      {activeTab === "certificates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-sans">
          
          {/* Certificate custom dynamic generator & verifier input */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-start">
            
            {/* Generate form wrapper */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="font-bold text-slate-100 flex items-center justify-end gap-1 border-b border-slate-800 pb-2">
                <span>نموذج صياغة وتوليد شهادة تخرج</span>
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </h4>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-slate-400 mb-1">اختر الطالب المعني</label>
                  <select value={selectedStudentForCert} onChange={e => setSelectedStudentForCert(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 focus:outline-none">
                    <option value="">-- اختر الطالب --</option>
                    {users.filter(u => u.role === "student" || u.role === "employee").map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">اختر الكورس التعليمي</label>
                  <select value={selectedCourseForCert} onChange={e => setSelectedCourseForCert(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 focus:outline-none">
                    <option value="">-- اختر المادة --</option>
                    {courses.map(co => <option key={co.id} value={co.id}>{co.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الدرجة النهائية (%)</label>
                  <input type="text" value={certGrade} onChange={e => setCertGrade(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-1 outline-none text-right font-mono" />
                </div>
                <button
                  onClick={handleGenerateCustomCertificate}
                  disabled={!selectedStudentForCert || !selectedCourseForCert}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-1.5 rounded"
                >
                  صغ قسيمة التخرج برقم الـ QR
                </button>
              </div>
            </div>

            {/* Verifier engine panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-start space-y-4">
              <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">سجلات الأكاديمية والتحقق من كود الشهادة QR</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                أدخل الكود بالأسفل لمحاكاة مسح QR أو ادخل كود الكشف الذي ولدته بالخطوة السابقة للتحقق الفوري.
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="HE-CERT..."
                  value={verificationCodeInput}
                  onChange={e => setVerificationCodeInput(e.target.value)}
                  className="w-full text-center tracking-widest uppercase bg-slate-950 border border-slate-800 font-mono text-slate-100 p-2 rounded text-xs focus:outline-none"
                />
                <button
                  onClick={handleVerifyCertificate}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 rounded font-sans transition"
                >
                  مسح وتحقق الآن
                </button>
              </div>

              {scannedResult && (
                <div className={`p-4 rounded-lg border text-xs text-right space-y-2 ${
                  scannedResult.isValid 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                }`}>
                  {scannedResult.isValid ? (
                    <>
                      <h4 className="font-bold flex items-center justify-end gap-1 font-sans text-emerald-400">
                        <GraduationCap className="w-4 h-4" />
                        الشهادة مسجلة ومعتمدة رسمياً!
                      </h4>
                      <p className="text-[11px] space-y-1 leading-normal">
                        <div>اسم الخريج: <b className="text-slate-100 font-sans">{scannedResult.studentName}</b></div>
                        <div>الدورة التعليمية: <b className="text-slate-100 font-sans">{scannedResult.courseTitle}</b></div>
                        <div>الدرجة النهائية: <b className="text-slate-100 font-mono">{scannedResult.grade}%</b></div>
                        <div>الرقم المسلسل: <b className="text-slate-100 font-mono">{scannedResult.id}</b></div>
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold text-[11px]">{scannedResult.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Graphical Certificate visual template */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-850 pb-2 mb-4 w-full">معاينة نموذج الشهادة المتخرجة المعتمدة والـ QR للطلاب</h3>

            {/* Template visual mock */}
            <div className="border-[8px] border-amber-600/35 bg-white text-slate-800 p-6 rounded-lg text-center max-w-lg w-full relative space-y-4 shadow-2xl overflow-hidden font-sans border-double" id="golden-cert-print-sheet">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start text-right text-[8px] text-slate-400">
                <span className="font-mono">ID: {customCertPreview ? customCertPreview.certificateId : "HE-CERT-992384"}</span>
                <span>Hossam Elwardany Professional Academy</span>
              </div>

              <div className="text-amber-600 font-bold tracking-widest text-sm uppercase italic">شهادة إتمام معتمدة ونخبوية</div>
              <p className="text-[10px] text-slate-500">تمنح الأكاديمية هذه الشهادة الفخرية والتقديرية للطالب المتميز</p>
              
              <div className="text-base font-extrabold text-slate-900 border-b border-amber-700/20 pb-2.5 font-sans">
                {customCertPreview ? customCertPreview.studentName : "رامي خالد عبد الحميد"}
              </div>

              <p className="text-[10px] text-slate-650 leading-relaxed italic text-slate-600 px-4">
                لاجتيازه بامتياز وجدارة اختبارات دبلومة: <b className="text-slate-900">{customCertPreview ? customCertPreview.courseTitle : "الدبلومة المتكاملة للتسويق الرقمي والوكالات"}</b> بنسبة نهائية معتمدة <b className="text-slate-900 font-mono">{customCertPreview ? customCertPreview.grade : "88"}%</b> وتدريبه العملي والتقني على إطلاق وتحليل الحملات بالذكاء الاصطناعي.
              </p>

              <div className="flex justify-between items-center pt-3 text-[9px] text-slate-500 border-t border-slate-100 font-sans">
                <div className="text-center bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="font-bold text-slate-700">كود التحقق والـ QR</div>
                  <div className="font-mono text-indigo-600 mt-1 uppercase font-bold text-[9px]">{customCertPreview ? customCertPreview.certificateId : "HE-CERT-992384"}</div>
                </div>
                <div className="text-center font-sans pr-4">
                  <div>تاريخ المأذونية</div>
                  <div className="font-mono font-bold text-slate-800 mt-1">{customCertPreview ? customCertPreview.date : "2026-06-13"}</div>
                </div>
                <div className="text-center font-sans text-right">
                  <div>الختم المشترك للأكاديمية</div>
                  <div className="font-bold text-amber-600 font-sans mt-0.5">م. حسام الورداني (CEO)</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة قسيمة الشهادة المعتمدة</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODALS */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateCourse} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إدراج كورس تعليمي جديد بالأكاديمية</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم الكورس بالتفصيل</label>
                <input required type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">المدرب المسؤول</label>
                  <select required value={newCourse.coachId} onChange={e => setNewCourse({...newCourse, coachId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200">
                    <option value="">-- اختر --</option>
                    {coaches.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سعر الكورس (EGP)</label>
                  <input required type="number" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">رابط الحصة التفاعلية المباشرة (Zoom / Meet)</label>
                <input required type="text" value={newCourse.zoomLink} onChange={e => setNewCourse({...newCourse, zoomLink: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-left font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">وصف كفايات التعلم والمهارات</label>
                <textarea rows={3} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-right font-sans" />
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">تأسيس الدورة</button>
              <button type="button" onClick={() => setShowCourseModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
